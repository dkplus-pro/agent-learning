"""ASR (Automatic Speech Recognition) service using DashScope."""

import tempfile
from pathlib import Path

from dashscope.audio.asr import Transcription

from config import settings


async def transcribe_audio(audio_bytes: bytes, file_ext: str = "webm") -> str:
    """
    Transcribe audio bytes to text using DashScope ASR API.

    Args:
        audio_bytes: Raw audio data
        file_ext: Audio file extension (webm, mp3, wav, etc.)

    Returns:
        Transcribed text

    Raises:
        Exception: If transcription fails
    """
    # Save audio to temporary file
    with tempfile.NamedTemporaryFile(
        mode="wb",
        suffix=f".{file_ext}",
        delete=False,
    ) as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_path = tmp_file.name

    try:
        # Call DashScope ASR API
        task_response = Transcription.async_call(
            model=settings.asr_model,
            api_key=settings.aliyun_dashscope_api_key,
            file_urls=[f"file://{tmp_path}"],
            language_hints=["zh", "en"],
        )

        # Wait for transcription to complete
        transcription_response = Transcription.wait(task_response.output.task_id)

        # Extract transcribed text
        if transcription_response.status_code == 200:
            results = transcription_response.output.get("results")
            if results:
                # Get the first result's transcription
                first_result = results[0]
                transcript_url = first_result.get("transcription_url")

                if transcript_url:
                    # Fetch transcription result
                    import httpx
                    async with httpx.AsyncClient() as client:
                        resp = await client.get(transcript_url)
                        if resp.status_code == 200:
                            data = resp.json()
                            # Extract text from transcription
                            transcripts = data.get("transcripts", [])
                            if transcripts:
                                return transcripts[0].get("text", "")

            return "[Transcription failed: no results]"
        else:
            error_msg = transcription_response.message or "Unknown error"
            return f"[ASR Error: {error_msg}]"

    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)
