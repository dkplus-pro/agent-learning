"""Tests for tool plugin system."""

import pytest

from tools.registry import discover_tools, get_all_tools, get_tool


@pytest.fixture(autouse=True)
def setup_tools():
    """Discover tools before each test."""
    discover_tools()


@pytest.mark.asyncio
async def test_discover_tools():
    """Test that tools are auto-discovered."""
    tools = get_all_tools()
    assert len(tools) >= 2
    tool_names = [t.name for t in tools]
    assert "writing" in tool_names
    assert "translate" in tool_names


@pytest.mark.asyncio
async def test_get_tool_by_name():
    """Test getting a tool by name."""
    tool = get_tool("writing")
    assert tool is not None
    assert tool.name == "writing"
    assert "写作" in tool.description


@pytest.mark.asyncio
async def test_get_nonexistent_tool():
    """Test getting a tool that doesn't exist."""
    tool = get_tool("nonexistent")
    assert tool is None


@pytest.mark.asyncio
async def test_tool_to_dict():
    """Test tool metadata serialization."""
    tool = get_tool("translate")
    assert tool is not None

    data = tool.to_dict()
    assert data["id"] == "translate"
    assert data["name"] == "translate"
    assert "翻译" in data["description"]
    assert len(data["parameters"]) > 0
    assert data["parameters"][0]["name"] == "target_lang"


@pytest.mark.asyncio
async def test_writing_tool_parameters():
    """Test writing tool has correct parameters."""
    tool = get_tool("writing")
    assert tool is not None
    assert len(tool.parameters) == 1
    assert tool.parameters[0].name == "style"
    assert tool.parameters[0].type == "string"


@pytest.mark.asyncio
async def test_translate_tool_parameters():
    """Test translate tool has correct parameters."""
    tool = get_tool("translate")
    assert tool is not None
    assert len(tool.parameters) == 1
    assert tool.parameters[0].name == "target_lang"
    assert tool.parameters[0].required is True


@pytest.mark.asyncio
async def test_tools_list_endpoint(client):
    """Test GET /api/tools endpoint."""
    response = await client.get("/api/tools/")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    # Check writing tool is in the list
    writing_tools = [t for t in data if t["id"] == "writing"]
    assert len(writing_tools) == 1
    assert "写作" in writing_tools[0]["description"]

    # Check translate tool is in the list
    translate_tools = [t for t in data if t["id"] == "translate"]
    assert len(translate_tools) == 1
    assert "翻译" in translate_tools[0]["description"]
