"""Tests for message CRUD routes."""

import pytest


@pytest.mark.asyncio
async def test_create_message(client):
    """Test creating a message."""
    # First create a conversation
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    # Create a message
    response = await client.post(
        "/api/messages/",
        json={
            "conversation_id": conv_id,
            "role": "user",
            "content": "Hello",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "user"
    assert data["content"] == "Hello"
    assert data["conversation_id"] == conv_id
    assert data["status"] == "complete"


@pytest.mark.asyncio
async def test_create_message_invalid_conversation(client):
    """Test creating a message in non-existent conversation."""
    response = await client.post(
        "/api/messages/",
        json={
            "conversation_id": "nonexistent",
            "role": "user",
            "content": "Hello",
        },
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_message_invalid_role(client):
    """Test creating a message with invalid role."""
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    response = await client.post(
        "/api/messages/",
        json={
            "conversation_id": conv_id,
            "role": "invalid",
            "content": "Hello",
        },
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_list_messages(client):
    """Test listing messages in a conversation."""
    # Create a conversation
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    # Create two messages
    await client.post(
        "/api/messages/",
        json={"conversation_id": conv_id, "role": "user", "content": "Q1"},
    )
    await client.post(
        "/api/messages/",
        json={"conversation_id": conv_id, "role": "assistant", "content": "A1"},
    )

    # List messages
    response = await client.get(f"/api/messages/{conv_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["role"] == "user"
    assert data[1]["role"] == "assistant"


@pytest.mark.asyncio
async def test_list_messages_empty(client):
    """Test listing messages in empty conversation."""
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    response = await client.get(f"/api/messages/{conv_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


@pytest.mark.asyncio
async def test_delete_message(client):
    """Test deleting a message."""
    # Create conversation and message
    conv_response = await client.post("/api/conversations/", json={"title": "测试"})
    conv_id = conv_response.json()["id"]

    msg_response = await client.post(
        "/api/messages/",
        json={"conversation_id": conv_id, "role": "user", "content": "To delete"},
    )
    msg_id = msg_response.json()["id"]

    # Delete message
    response = await client.delete(f"/api/messages/{msg_id}")
    assert response.status_code == 204

    # Verify it's gone
    response = await client.get(f"/api/messages/{conv_id}")
    data = response.json()
    assert len(data) == 0


@pytest.mark.asyncio
async def test_delete_message_not_found(client):
    """Test deleting non-existent message."""
    response = await client.delete("/api/messages/nonexistent")
    assert response.status_code == 404
