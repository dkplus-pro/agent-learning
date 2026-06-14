"""Tests for chat streaming API."""

from unittest.mock import AsyncMock, patch

import pytest


async def _mock_stream_generator(chunks: list[str]):
    """Helper: creates a mock async generator for stream_chat."""
    for chunk in chunks:
        yield chunk


@pytest.mark.asyncio
async def test_stream_chat_basic(client):
    """Test basic chat streaming without tool."""
    # Create conversation
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    # Mock the async stream_chat function (not the sync Generation.call)
    mock_chunks = ["Hello", "!"]
    mock_gen = _mock_stream_generator(mock_chunks)

    with patch("routers.chat.default_stream", return_value=mock_gen):
        response = await client.post(
            "/api/chat/stream",
            json={
                "conversation_id": conv_id,
                "message": "Hi",
            },
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

        # Read SSE stream
        content = await response.aread()
        text = content.decode()

        # Should contain chunk events
        assert "chunk" in text
        # Should contain done event
        assert "done" in text


@pytest.mark.asyncio
async def test_stream_chat_with_tool(client):
    """Test chat streaming with a tool."""
    # Create conversation
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    mock_chunks = ["润色", "后的", "文本"]
    mock_gen = _mock_stream_generator(mock_chunks)

    with patch("tools.writing.stream_chat", return_value=mock_gen):
        response = await client.post(
            "/api/chat/stream",
            json={
                "conversation_id": conv_id,
                "message": "请帮我润色这段文字",
                "tool_id": "writing",
                "tool_params": {"style": "formal"},
            },
        )

        assert response.status_code == 200

        content = await response.aread()
        text = content.decode()
        assert "chunk" in text


@pytest.mark.asyncio
async def test_stream_chat_invalid_conversation(client):
    """Test chat streaming with invalid conversation ID."""
    response = await client.post(
        "/api/chat/stream",
        json={
            "conversation_id": "nonexistent",
            "message": "Hi",
        },
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_stream_chat_auto_title(client):
    """Test that first message auto-generates title."""
    # Create conversation with default title
    conv_response = await client.post("/api/conversations/", json={})
    conv_id = conv_response.json()["id"]
    assert conv_response.json()["title"] == "新对话"

    mock_chunks = ["Response"]
    mock_gen = _mock_stream_generator(mock_chunks)

    with patch("routers.chat.default_stream", return_value=mock_gen):
        response = await client.post(
            "/api/chat/stream",
            json={
                "conversation_id": conv_id,
                "message": "这是一条很长的测试消息用于测试自动标题功能",
            },
        )

        assert response.status_code == 200

        content = await response.aread()
        text = content.decode()

        # Should contain title event
        assert "title" in text

        # Verify conversation title was updated
        conv_response = await client.get(f"/api/conversations/{conv_id}")
        new_title = conv_response.json()["title"]
        assert new_title != "新对话"
        assert len(new_title) <= 33  # 30 chars + "..."


@pytest.mark.asyncio
async def test_stream_chat_saves_messages(client):
    """Test that chat streaming saves user and assistant messages."""
    # Create conversation
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    mock_chunks = ["AI", "回复"]
    mock_gen = _mock_stream_generator(mock_chunks)

    with patch("routers.chat.default_stream", return_value=mock_gen):
        await client.post(
            "/api/chat/stream",
            json={
                "conversation_id": conv_id,
                "message": "用户消息",
            },
        )

        # Verify messages were saved
        msg_response = await client.get(f"/api/messages/{conv_id}")
        messages = msg_response.json()

        assert len(messages) == 2
        assert messages[0]["role"] == "user"
        assert messages[0]["content"] == "用户消息"
        assert messages[1]["role"] == "assistant"
        assert "AI" in messages[1]["content"]
