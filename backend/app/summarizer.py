import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from .utils import count_words

# Initialize client using environment variable
load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PRESETS = {
    "short": (60, 90),
    "medium": (120, 180),
    "long": (220, 320)
}

async def generate_grounded_summary(text: str, preset: str, format: str, target: int = None):
    min_w, max_w = PRESETS[preset]
    if target:
        max_w = max(40, min(450, target))
        min_w = int(max_w * 0.7)

    # System prompt enforces grounding and prohibits hallucinations
    system_message = """You are a grounded summarization assistant. 
        1. Use ONLY facts from the provided text. 
        2. Do not include external knowledge or hallucinations. 
        3. Strictly follow the requested length and format.
        4. You must output valid JSON with exactly these keys: 
            'paragraph', 'bullets', 'takeaways'.
        5. If the text is insufficient to reach the length, be concise rather than inventing details."""
            

    # Construct the user prompt with specific constraints
    user_prompt = (
        f"SOURCE TEXT: {text[:15000]}\n\n" # Context window safety
        f"INSTRUCTIONS:\n"
        f"- Output Format: {format}\n"
        f"- Target Length: {min_w}-{max_w} words\n"
        f"- Key Takeaways: Provide 3 to 7 bullet points\n"
        f"- Grounding: Every statement must be supported by the source text."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o", # Or "gpt-3.5-turbo" for lower cost
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}, # Ensures valid JSON output
            temperature=0.1 # Low temperature reduces creative hallucinations
        )

        # Parse the JSON response
        content = json.loads(response.choices[0].message.content)
        
        return {
            "paragraph": content.get("paragraph"),
            "bullets": content.get("bullets", []),
            "takeaways": content.get("takeaways", []),
            "model": response.model
        }
    except Exception as e:
        # Fallback error handling
        print(f"OpenAI API Error: {e}")
        raise