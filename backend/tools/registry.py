"""Tool registry with auto-discovery."""

import importlib
import inspect
from pathlib import Path
from typing import Type

from tools.base import ToolHandler

_registry: dict[str, ToolHandler] = {}


def register_tool(tool_class: Type[ToolHandler]) -> Type[ToolHandler]:
    """Decorator to register a tool handler."""
    instance = tool_class()
    _registry[instance.name] = instance
    return tool_class


def get_tool(name: str) -> ToolHandler | None:
    """Get a registered tool by name."""
    return _registry.get(name)


def get_all_tools() -> list[ToolHandler]:
    """Get all registered tools."""
    return list(_registry.values())


def discover_tools() -> None:
    """
    Auto-discover and register tools from the tools directory.

    Scans all Python files in the tools/ directory (excluding base.py and registry.py)
    and imports them to trigger registration.
    """
    tools_dir = Path(__file__).parent

    for file in tools_dir.glob("*.py"):
        if file.name in ("__init__.py", "base.py", "registry.py"):
            continue

        module_name = f"tools.{file.stem}"
        try:
            module = importlib.import_module(module_name)

            # Find all ToolHandler subclasses in the module
            for _, obj in inspect.getmembers(module, inspect.isclass):
                if (
                    issubclass(obj, ToolHandler)
                    and obj is not ToolHandler
                    and hasattr(obj, "name")
                ):
                    # Register if not already registered
                    if obj.name not in _registry:
                        instance = obj()
                        _registry[instance.name] = instance
        except Exception as e:
            print(f"Warning: Failed to load tool from {file.name}: {e}")
