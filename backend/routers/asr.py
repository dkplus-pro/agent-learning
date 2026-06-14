"""ASR (Automatic Speech Recognition) API router."""

from fastapi import APIRouter, File, UploadFile

from services.asr_service import transcribe_audio

router = APIRouter(prefix="/api/asr", tags=["asr"])


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    Transcribe audio file to text.

    Accepts audio files (webm, mp3, wav, etc.) and returns transcribed text.
    """
    # Read audio bytes
    audio_bytes = await audio.read()

    # Extract file extension from filename
    file_ext = "webm"  # Default
    if audio.filename:
        ext = audio.filename.rsplit(".", 1)[-1].lower()
        if ext in ("webm", "mp3", "wav", "m4a", "ogg"):
            file_ext = ext

    # Transcribe
    text = await transcribe_audio(audio_bytes, file_ext)

    return {"text": text, "filename": audio.filename}
