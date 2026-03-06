import io
import pdfplumber
from docx import Document
from fastapi import HTTPException

# Constants based on Spec
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
MAX_WORD_LIMIT = 25000

def validate_file_size(file_size: int):
    if file_size > MAX_FILE_SIZE_BYTES:
        # HTTP 413 Payload Too Large
        raise HTTPException(
            status_code=413, 
            detail="File exceeds 15MB limit. Please upload a smaller document."
        )

def extract_text_from_pdf(file_bytes: bytes):
    text_content = []
    page_count = 0
    
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
    
    full_text = "\n".join(text_content)
    
    # Validation: Scanned PDF Detection (MVP requirement)
    if len(full_text.strip()) < 50 and page_count > 0:
        raise HTTPException(
            status_code=422,
            detail="Extraction quality low. This PDF appears to be a scan (no OCR support)."
        )
        
    return full_text, page_count

def extract_text_from_docx(file_bytes: bytes):
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs]), None
    except Exception:
        raise HTTPException(status_code=422, detail="Failed to parse DOCX structure.")

def extract_text_from_txt(file_bytes: bytes):
    try:
        # Try UTF-8 first, fallback to latin-1
        return file_bytes.decode("utf-8"), None
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1"), None

def get_parser(mime_type: str):
    parsers = {
        "application/pdf": extract_text_from_pdf,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extract_text_from_docx,
        "text/plain": extract_text_from_txt
    }
    if mime_type not in parsers:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    return parsers[mime_type]