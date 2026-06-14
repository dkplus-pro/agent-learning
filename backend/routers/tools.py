"""Tools API router."""

from fastapi import APIRouter

from tools.registry import discover_tools, get_all_tools

router = APIRouter(prefix="/api/tools", tags=["tools"])

# Discover tools on startup
discover_tools()


@router.get("/")
async def list_tools():
    """List all available tools."""
    tools = get_all_tools()
    return [tool.to_dict() for tool in tools]
