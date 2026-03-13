import httpx
import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException
from readability import Document

BLACKLIST_RANGES = [
    "10.0.0.0/8",
    "127.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "169.254.169.254/32",
]

# Signals that indicate a bot wall / CAPTCHA page was served
BOT_WALL_SIGNALS = [
    "recaptcha",
    "captcha",
    "browser check",
    "cloudflare",
    "please enable javascript",
    "checking your browser",
    "ddos-guard",
    "just a moment",
    "enable cookies",
    "access denied",
    "blocked",
]

# Browser-like headers to avoid simple bot detection
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def is_ssrf_safe(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False
        hostname = parsed.hostname
        ip_address = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_address)
        for network in BLACKLIST_RANGES:
            if ip_obj in ipaddress.ip_network(network):
                return False
        return True
    except Exception:
        return False


def is_bot_walled(html: str) -> bool:
    """Check if the response is a bot/CAPTCHA wall instead of real content."""
    lower = html.lower()
    return any(signal in lower for signal in BOT_WALL_SIGNALS)


def has_meaningful_content(text: str, min_chars: int = 200) -> bool:
    """Check if readability extracted enough real content."""
    return len(text.strip()) >= min_chars


async def fetch_via_jina(url: str) -> dict:
    """
    Primary fetcher — uses Jina AI Reader (r.jina.ai) which bypasses
    most bot protections, paywalls, and JS-rendered pages.
    Free, no API key required.
    """
    jina_url = f"https://r.jina.ai/{url}"
    async with httpx.AsyncClient(timeout=25.0) as client:
        response = await client.get(
            jina_url,
            follow_redirects=True,
            headers={"Accept": "text/plain"},
        )
        response.raise_for_status()
        text = response.text.strip()

        if not has_meaningful_content(text):
            raise ValueError("Jina returned insufficient content.")

        # Jina returns clean markdown — extract a rough title from first line
        first_line = text.splitlines()[0].lstrip("#").strip() if text else url

        return {
            "text": text,
            "title": first_line,
            "url": url,
        }


async def fetch_via_direct(url: str) -> dict:
    """
    Fallback fetcher — direct HTTP request with browser-like headers
    + readability extraction. Works for most unprotected pages.
    """
    async with httpx.AsyncClient(
        timeout=15.0, headers=BROWSER_HEADERS
    ) as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()

        # Detect bot wall before extracting
        if is_bot_walled(response.text):
            raise ValueError("Bot wall detected in direct fetch.")

        doc = Document(response.text)
        extracted = doc.summary()

        if not has_meaningful_content(extracted):
            raise ValueError("Direct fetch returned insufficient content.")

        return {
            "text": extracted,
            "title": doc.title(),
            "url": str(response.url),
        }


async def safe_fetch_url(url: str) -> dict:
    """
    Main entry point for URL fetching.

    Strategy:
    1. SSRF safety check
    2. Try Jina AI Reader first (handles bot-protected & JS-rendered pages)
    3. Fall back to direct fetch with browser headers
    4. If both fail, return a clear user-friendly error
    """
    if not is_ssrf_safe(url):
        raise HTTPException(
            status_code=400,
            detail="URL blocked: private or invalid IP range detected."
        )

    # ── Attempt 1: Jina AI Reader ────────────────────────────────
    try:
        return await fetch_via_jina(url)
    except Exception as jina_err:
        print(f"[fetcher] Jina failed for {url}: {jina_err}")

    # ── Attempt 2: Direct fetch with browser headers ─────────────
    try:
        return await fetch_via_direct(url)
    except ValueError as wall_err:
        # Bot wall or thin content detected — give user a clear message
        raise HTTPException(
            status_code=422,
            detail=(
                "This page is protected by a CAPTCHA or bot wall and cannot "
                "be fetched automatically. Try copying the article text and "
                "pasting it into the Text tab instead."
            )
        )
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if status == 403:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Access to this page was denied (403). The site may require "
                    "login or block automated access. Try the Text tab instead."
                )
            )
        elif status == 404:
            raise HTTPException(
                status_code=404,
                detail="The URL returned a 404 — page not found. Check the link and try again."
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Could not fetch URL: server returned {status}."
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch URL: {str(e)}"
        )