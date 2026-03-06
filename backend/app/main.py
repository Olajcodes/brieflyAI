from typing import Optional, Literal
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import (
    SummarizeRequest, 
    SummarizeUrlRequest,  # Ensure this exists in schemas.py
    BaseSummaryResponse, 
    UrlSummaryResponse, 
    FileSummaryResponse
)
from .utils import get_request_id, calculate_metrics, MAX_WORD_LIMIT
from .fetcher import safe_fetch_url
from .file_parser import get_parser, validate_file_size
from .summarizer import generate_grounded_summary

app = FastAPI(title="Briefly AI API")

# --- CORS CONFIGURATION ---
# In production, replace ["*"] with your specific frontend URL (e.g., ["https://your-app.vercel.app"])
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=["*"],
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Allows Content-Type, Authorization, etc.
)

@app.post("/v1/summarize", response_model=BaseSummaryResponse)
async def summarize_text(req: SummarizeRequest):
    req_id = get_request_id()
    
    res = await generate_grounded_summary(
        req.text, req.length_preset, req.output_format, req.target_word_count
    )
    metrics = calculate_metrics(req.text, res['paragraph'], res['bullets'])
    
    return {
        "request_id": req_id,
        "summary_paragraph": res['paragraph'] if req.output_format in ['paragraph', 'both'] else None,
        "summary_bullets": res['bullets'] if req.output_format in ['bullet_points', 'both'] else [],
        "key_takeaways": res['takeaways'],
        "metrics": metrics,
        "model_info": {"provider": "OpenAI", "model": res['model']}
    }

@app.post("/v1/summarize-url", response_model=UrlSummaryResponse)
async def summarize_url(req: SummarizeUrlRequest):
    req_id = get_request_id()
    
    # 1. Fetch and Extract
    fetched = await safe_fetch_url(req.url)
    
    # 2. Process Summarization
    res = await generate_grounded_summary(
        fetched['text'], req.length_preset, req.output_format, req.target_word_count
    )
    
    metrics = calculate_metrics(fetched['text'], res['paragraph'], res['bullets'])
    
    return {
        "request_id": req_id,
        "summary_paragraph": res['paragraph'] if req.output_format in ['paragraph', 'both'] else None,
        "summary_bullets": res['bullets'] if req.output_format in ['bullet_points', 'both'] else [],
        "key_takeaways": res['takeaways'],
        "metrics": metrics,
        "model_info": {"provider": "OpenAI", "model": res['model']},
        "source": {
            "type": "url",
            "url": fetched['url'],
            "title": fetched.get('title'),
            "published_at": fetched.get('published_at')
        }
    }

@app.post("/v1/summarize-file", response_model=FileSummaryResponse)
async def summarize_file(
    file: UploadFile = File(...),
    length_preset: Literal["short", "medium", "long"] = Form(...),
    output_format: Literal["paragraph", "bullet_points", "both"] = Form(...),
    target_word_count: Optional[int] = Form(None)
):
    # 1. Type & Size Validation
    if file.content_type not in [
        "application/pdf", 
        "text/plain", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and TXT allowed.")
    
    req_id = get_request_id()
    content = await file.read()
    validate_file_size(len(content))
    
    # 2. Parse Text
    parser_func = get_parser(file.content_type)
    extracted_text, pages = parser_func(content)
    
    # 3. Word Count Check
    word_count = len(extracted_text.split())
    if word_count > MAX_WORD_LIMIT:
        raise HTTPException(status_code=413, detail=f"Extracted text exceeds {MAX_WORD_LIMIT} word limit.")
    
    # 4. Process Summarization
    res = await generate_grounded_summary(
        extracted_text, length_preset, output_format, target_word_count
    )
    
    metrics = calculate_metrics(extracted_text, res['paragraph'], res['bullets'])
    
    return {
        "request_id": req_id,
        "summary_paragraph": res['paragraph'] if output_format in ['paragraph', 'both'] else None,
        "summary_bullets": res['bullets'] if output_format in ['bullet_points', 'both'] else [],
        "key_takeaways": res['takeaways'],
        "metrics": metrics,
        "model_info": {"provider": "OpenAI", "model": res['model']},
        "source": {
            "type": "file",
            "filename": file.filename,
            "file_type": file.filename.split('.')[-1].lower(),
            "page_count": pages,
            "extraction_quality": "good"
        }
    }