"""Tests for ASR API."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_transcribe_audio_success(client):
    """Test successful audio transcription."""
    # Mock ASR service at the router import level
    with patch("routers.asr.transcribe_audio", new_callable=AsyncMock) as mock_transcribe:
        mock_transcribe.return_value = "你好世界"

        # Create fake audio file
        audio_content = b"fake audio data"

        response = await client.post(
            "/api/asr/transcribe",
            files={"audio": ("test.webm", audio_content, "audio/webm")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "你好世界"
        assert data["filename"] == "test.webm"

        # Verify service was called
        mock_transcribe.assert_called_once()


@pytest.mark.asyncio
async def test_transcribe_audio_empty(client):
    """Test transcription with empty audio."""
    with patch("routers.asr.transcribe_audio", new_callable=AsyncMock) as mock_transcribe:
        mock_transcribe.return_value = ""

        response = await client.post(
            "/api/asr/transcribe",
            files={"audio": ("empty.webm", b"", "audio/webm")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["text"] == ""


@pytest.mark.asyncio
async def test_transcribe_audio_error(client):
    """Test transcription with ASR error."""
    with patch("routers.asr.transcribe_audio", new_callable=AsyncMock) as mock_transcribe:
        mock_transcribe.return_value = "[ASR Error: API quota exceeded]"

        response = await client.post(
            "/api/asr/transcribe",
            files={"audio": ("test.mp3", b"audio data", "audio/mpeg")},
        )

        assert response.status_code == 200
        data = response.json()
        assert "Error" in data["text"]


@pytest.mark.asyncio
async def test_transcribe_audio_different_formats(client):
    """Test transcription with different audio formats."""
    formats = [
        ("test.webm", "audio/webm"),
        ("test.mp3", "audio/mpeg"),
        ("test.wav", "audio/wav"),
        ("test.m4a", "audio/mp4"),
    ]

    for filename, content_type in formats:
        with patch("routers.asr.transcribe_audio", new_callable=AsyncMock) as mock_transcribe:
            mock_transcribe.return_value = "测试文本"

            response = await client.post(
                "/api/asr/transcribe",
                files={"audio": (filename, b"audio data", content_type)},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["text"] == "测试文本"
            assert data["filename"] == filename
