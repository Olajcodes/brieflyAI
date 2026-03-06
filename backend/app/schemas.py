from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Literal

class SummarizeUrlRequest(BaseModel):
    url: str
    length_preset: Literal["short", "medium", "long"]
    target_word_count: Optional[int] = None
    output_format: Literal["paragraph", "bullet_points", "both"]
    language: str = "auto"
    
    
class SummarizeRequest(BaseModel):
    text: str
    length_preset: Literal["short", "medium", "long"]
    target_word_count: Optional[int] = None
    output_format: Literal["paragraph", "bullet_points", "both"]
    language: str = "auto"

class Metrics(BaseModel):
    compression_ratio: float
    input_stats: dict # {"word_count": int, "char_count": int}
    summary_stats: dict # {"word_count": int, "char_count": int}
    estimated_minutes_saved: float

class BaseSummaryResponse(BaseModel):
    request_id: str
    summary_paragraph: Optional[str]
    summary_bullets: List[str]
    key_takeaways: List[str]
    metrics: Metrics
    model_info: dict # {"provider": str, "model": str}

class UrlSummaryResponse(BaseSummaryResponse):
    source: dict # {"type": "url", "url": str, "title": str|null, "published_at": str|null}

class FileSummaryResponse(BaseSummaryResponse):
    source: dict # {"type": "file", "filename": str, "file_type": str, "page_count": int|null, "extraction_quality": str}