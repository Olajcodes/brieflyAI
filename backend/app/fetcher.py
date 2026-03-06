import httpx
import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException
from readability import Document

BLACKLIST_RANGES = ["10.0.0.0/8", "127.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.169.254"]

def is_ssrf_safe(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False
        
        hostname = parsed.hostname
        # Resolve IP to check against blacklist
        ip_address = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_address)
        
        for network in BLACKLIST_RANGES:
            if ip_obj in ipaddress.ip_network(network):
                return False
        return True
    except Exception:
        return False

async def safe_fetch_url(url: str):
    if not is_ssrf_safe(url):
        raise HTTPException(status_code=400, detail="URL blocked: Private or invalid IP range detected.")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
            doc = Document(response.text)
            return {
                "text": doc.summary(),
                "title": doc.title(),
                "url": str(response.url)
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {str(e)}")