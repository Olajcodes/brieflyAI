from typing import Optional, Literal
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import (
    SummarizeRequest,
    SummarizeUrlRequest,
    BaseSummaryResponse,
    UrlSummaryResponse,
    FileSummaryResponse,
    TranscribeResponse,
    AudioSummaryResponse,
)
from .utils import get_request_id, calculate_metrics, MAX_WORD_LIMIT
from .fetcher import safe_fetch_url
from .file_parser import get_parser, validate_file_size
from .summarizer import generate_grounded_summary
from .transcriber import transcribe_audio, validate_audio

app = FastAPI(title="Briefly AI API")

# --- CORS CONFIGURATION ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your production frontend URL here e.g. "https://your-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── TEXT ─────────────────────────────────────────────────────────

@app.post("/v1/summarize", response_model=BaseSummaryResponse)
async def summarize_text(req: SummarizeRequest):
    req_id = get_request_id()
    res = await generate_grounded_summary(
        req.text, req.length_preset, req.output_format, req.target_word_count, req.language
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


# ── URL ──────────────────────────────────────────────────────────

@app.post("/v1/summarize-url", response_model=UrlSummaryResponse)
async def summarize_url(req: SummarizeUrlRequest):
    req_id = get_request_id()
    fetched = await safe_fetch_url(req.url)
    res = await generate_grounded_summary(
        fetched['text'], req.length_preset, req.output_format, req.target_word_count, req.language
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


# ── FILE ─────────────────────────────────────────────────────────

@app.post("/v1/summarize-file", response_model=FileSummaryResponse)
async def summarize_file(
    file: UploadFile = File(...),
    length_preset: Literal["short", "medium", "long"] = Form(...),
    output_format: Literal["paragraph", "bullet_points", "both"] = Form(...),
    target_word_count: Optional[int] = Form(None),
    language: str = Form("auto"),  # ← added
):
    if file.content_type not in [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and TXT allowed.")

    req_id = get_request_id()
    content = await file.read()
    validate_file_size(len(content))

    parser_func = get_parser(file.content_type)
    extracted_text, pages = parser_func(content)

    if len(extracted_text.split()) > MAX_WORD_LIMIT:
        raise HTTPException(status_code=413, detail=f"Extracted text exceeds {MAX_WORD_LIMIT} word limit.")

    res = await generate_grounded_summary(
        extracted_text, length_preset, output_format, target_word_count, language  # ← passed
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


# ── AUDIO ────────────────────────────────────────────────────────

@app.post("/v1/transcribe-audio", response_model=TranscribeResponse)
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """Stage 1 — transcription only, no summarization."""
    content = await file.read()
    validate_audio(file.content_type, len(content))
    req_id = get_request_id()
    result = await transcribe_audio(content, file.content_type, file.filename)
    return {
        "request_id": req_id,
        "transcript": result["transcript"],
        "detected_language": result["detected_language"],
        "duration_seconds": result["duration_seconds"],
        "word_count": result["word_count"],
    }


@app.post("/v1/summarize-audio", response_model=AudioSummaryResponse)
async def summarize_audio_endpoint(
    file: UploadFile = File(...),
    length_preset: Literal["short", "medium", "long"] = Form(...),
    output_format: Literal["paragraph", "bullet_points", "both"] = Form(...),
    target_word_count: Optional[int] = Form(None),
    language: str = Form("auto"),  # ← added
):
    """Combined: transcribe + summarize. Always returns transcript for frontend review panel."""
    content = await file.read()
    validate_audio(file.content_type, len(content))
    req_id = get_request_id()

    transcription = await transcribe_audio(content, file.content_type, file.filename)
    transcript = transcription["transcript"]

    if transcription["word_count"] > MAX_WORD_LIMIT:
        raise HTTPException(
            status_code=413,
            detail=f"Transcript exceeds {MAX_WORD_LIMIT} word limit. Recording may be too long."
        )

    res = await generate_grounded_summary(
        transcript, length_preset, output_format, target_word_count, language  # ← passed
    )
    metrics = calculate_metrics(transcript, res['paragraph'], res['bullets'])
    return {
        "request_id": req_id,
        "summary_paragraph": res['paragraph'] if output_format in ['paragraph', 'both'] else None,
        "summary_bullets": res['bullets'] if output_format in ['bullet_points', 'both'] else [],
        "key_takeaways": res['takeaways'],
        "metrics": metrics,
        "model_info": {"provider": "OpenAI", "model": res['model']},
        "transcript": transcript,
        "source": {
            "type": "audio",
            "filename": file.filename,
            "detected_language": transcription["detected_language"],
            "duration_seconds": transcription["duration_seconds"],
        }
    }