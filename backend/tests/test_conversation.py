"""Tests for conversation CRUD routes."""

import pytest


@pytest.mark.asyncio
async def test_create_conversation(client):
    """Test creating a conversation."""
    response = await client.post(
        "/api/conversations/",
        json={"title": "测试对话"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "测试对话"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_conversation_default_title(client):
    """Test creating a conversation with default title."""
    response = await client.post("/api/conversations/", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "新对话"


@pytest.mark.asyncio
async def test_list_conversations(client):
    """Test listing conversations."""
    # Create two conversations
    await client.post("/api/conversations/", json={"title": "对话1"})
    await client.post("/api/conversations/", json={"title": "对话2"})

    response = await client.get("/api/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_conversation(client):
    """Test getting a single conversation."""
    # Create a conversation
    create_response = await client.post(
        "/api/conversations/",
        json={"title": "测试"},
    )
    conv_id = create_response.json()["id"]

    # Get it
    response = await client.get(f"/api/conversations/{conv_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == conv_id
    assert data["title"] == "测试"


@pytest.mark.asyncio
async def test_get_conversation_not_found(client):
    """Test getting a non-existent conversation."""
    response = await client.get("/api/conversations/nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_conversation(client):
    """Test updating a conversation title."""
    # Create a conversation
    create_response = await client.post(
        "/api/conversations/",
        json={"title": "原标题"},
    )
    conv_id = create_response.json()["id"]

    # Update it
    response = await client.patch(
        f"/api/conversations/{conv_id}",
        json={"title": "新标题"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "新标题"


@pytest.mark.asyncio
async def test_delete_conversation(client):
    """Test deleting a conversation."""
    # Create a conversation
    create_response = await client.post(
        "/api/conversations/",
        json={"title": "要删除"},
    )
    conv_id = create_response.json()["id"]

    # Delete it
    response = await client.delete(f"/api/conversations/{conv_id}")
    assert response.status_code == 204

    # Verify it's gone
    response = await client.get(f"/api/conversations/{conv_id}")
    assert response.status_code == 404
