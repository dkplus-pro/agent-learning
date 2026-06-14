"""工具注册表，支持自动发现。"""

import importlib
import inspect
from pathlib import Path
from typing import Type

from tools.base import ToolHandler

_registry: dict[str, ToolHandler] = {}


def register_tool(tool_class: Type[ToolHandler]) -> Type[ToolHandler]:
    """装饰器：注册一个工具处理器。"""
    instance = tool_class()
    _registry[instance.name] = instance
    return tool_class


def get_tool(name: str) -> ToolHandler | None:
    """根据名称获取已注册的工具。"""
    return _registry.get(name)


def get_all_tools() -> list[ToolHandler]:
    """获取所有已注册的工具。"""
    return list(_registry.values())


def discover_tools() -> None:
    """
    自动发现并注册 tools 目录中的工具。

    扫描 tools/ 目录下所有 Python 文件（排除 base.py 和 registry.py），
    并导入它们以触发注册。
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
