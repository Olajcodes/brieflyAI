import os
import io
from fastapi import HTTPException
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Supported audio MIME types by Whisper
SUPPORTED_AUDIO_TYPES = {
    "audio/mpeg":       "mp3",
    "audio/mp4":        "mp4",
    "audio/wav":        "wav",
    "audio/x-wav":      "wav",
    "audio/webm":       "webm",
    "video/webm":       "webm",   # browser MediaRecorder often sends this
    "audio/m4a":        "m4a",
    "audio/x-m4a":      "m4a",
    "audio/ogg":        "ogg",
    "audio/flac":       "flac",
}

MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024  # Whisper's hard limit: 25MB

def validate_audio(content_type: str, file_size: int):
    if content_type not in SUPPORTED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Supported: MP3, MP4, WAV, WEBM, M4A, OGG, FLAC."
        )
    if file_size > MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Audio file exceeds Whisper's 25MB limit. Please upload a shorter recording."
        )

async def transcribe_audio(file_bytes: bytes, content_type: str, filename: str) -> dict:
    """
    Sends audio to OpenAI Whisper and returns transcript + metadata.
    """
    extension = SUPPORTED_AUDIO_TYPES[content_type]

    try:
        # Whisper requires a file-like object with a name attribute
        audio_file = (f"audio.{extension}", io.BytesIO(file_bytes), content_type)

        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",  # Returns language + duration + segments
            timestamp_granularities=["segment"]
        )

        transcript = response.text.strip()

        if not transcript:
            raise HTTPException(
                status_code=422,
                detail="Whisper returned an empty transcript. The audio may be silent or inaudible."
            )

        word_count = len(transcript.split())
        duration_seconds = getattr(response, "duration", None)
        detected_language = getattr(response, "language", "unknown")

        return {
            "transcript": transcript,
            "detected_language": detected_language,
            "duration_seconds": round(duration_seconds, 1) if duration_seconds else None,
            "word_count": word_count,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")