import uuid
import re
from typing import List, Optional

MAX_WORD_LIMIT = 25000 

def get_request_id():
    return str(uuid.uuid4())

def count_words(text: Optional[str]) -> int:
    if not text: return 0
    return len(re.findall(r'\w+', text))

def calculate_metrics(input_text: str, summary_para: Optional[str], summary_bullets: List[str]):
    in_words = count_words(input_text)
    
    # Safely handle potential None for paragraph
    para_words = count_words(summary_para)
    bullet_words = count_words(" ".join(summary_bullets))
    sum_words = para_words + bullet_words
    
    return {
        "compression_ratio": round(sum_words / in_words if in_words > 0 else 0, 2),
        "input_stats": {"word_count": in_words, "char_count": len(input_text)},
        "summary_stats": {"word_count": sum_words, "char_count": (len(summary_para or "") + len("".join(summary_bullets)))},
        "estimated_minutes_saved": round(max(0, (in_words - sum_words) / 200), 1)
    }