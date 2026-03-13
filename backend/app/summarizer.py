import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from .utils import count_words

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PRESETS = {
    "short": (60, 90),
    "medium": (120, 180),
    "long": (220, 320)
}

# Supported language codes → full names for the prompt
LANGUAGE_NAMES = {
    "auto": "auto",
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "hi": "Hindi",
    "yo": "Yoruba",
    "ha": "Hausa",
    "ig": "Igbo",
    "pcm": "Nigerian Pidgin English",
}


def build_language_instruction(language: str) -> str:
    """
    Build a clear, unambiguous language instruction for the prompt.

    - "en" (default) → always respond in English
    - "auto"         → match the source text language
    - anything else  → respond in that specific language
    """
    lang = language.strip().lower() if language else "en"

    if lang == "auto":
        return (
            "Detect the PRIMARY language of the main body content of the source text "
            "(ignore metadata, author names, references, and headers which may be in other languages). "
            "Write your ENTIRE response in that detected primary language only. "
            "If the main body content is clearly in English, respond in English."
        )

    lang_name = LANGUAGE_NAMES.get(lang)

    if lang_name:
        return (
            f"Write your ENTIRE response in {lang_name} only. "
            f"Do NOT respond in any other language, regardless of the source text language."
        )

    # Unknown code — fall back to English
    return (
        "Write your entire response in English only. "
        "Do NOT respond in any other language."
    )


async def generate_grounded_summary(
    text: str,
    preset: str,
    format: str,
    target: int = None,
    language: str = "auto",  # Default: auto-detect primary body language
):
    min_w, max_w = PRESETS[preset]
    if target:
        max_w = max(40, min(450, target))
        min_w = int(max_w * 0.7)

    lang_instruction = build_language_instruction(language)

    # Language rule is placed in BOTH system and user prompt to maximise compliance
    system_message = (
        "You are a grounded summarization assistant.\n"
        "1. Use ONLY facts from the provided text.\n"
        "2. Do not include external knowledge or hallucinations.\n"
        "3. Strictly follow the requested length and format.\n"
        "4. Output valid JSON with exactly these keys: 'paragraph', 'bullets', 'takeaways'.\n"
        "5. If the text is insufficient to reach the length, be concise rather than inventing details.\n"
        f"6. LANGUAGE RULE (STRICT — override everything else): {lang_instruction}"
    )

    user_prompt = (
        f"SOURCE TEXT: {text[:150000]}\n\n"
        f"INSTRUCTIONS:\n"
        f"- Output Format: {format}\n"
        f"- Target Length: {min_w}-{max_w} words\n"
        f"- Key Takeaways: Provide 3 to 7 bullet points\n"
        f"- Grounding: Every statement must be supported by the source text.\n"
        f"- LANGUAGE (mandatory): {lang_instruction}"
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        content = json.loads(response.choices[0].message.content)

        return {
            "paragraph": content.get("paragraph"),
            "bullets": content.get("bullets", []),
            "takeaways": content.get("takeaways", []),
            "model": response.model
        }
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        raise