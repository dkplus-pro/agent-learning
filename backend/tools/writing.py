"""Writing assistant tool."""

from typing import Any, AsyncIterator

from services.llm_service import stream_chat
from tools.base import ToolHandler, ToolParameter
from tools.registry import register_tool


@register_tool
class WritingTool(ToolHandler):
    """AI writing assistant tool."""

    name = "writing"
    description = "AI写作助手 - 帮助润色、改写、扩展文本"
    system_prompt = """你是一个专业的AI写作助手。你的任务是帮助用户：
- 润色和改写文本，使其更加流畅和专业
- 扩展简短的想法，提供更详细的内容
- 调整文本的语气和风格（正式/非正式、学术/通俗等）
- 修正语法和拼写错误

请根据用户的要求，提供高质量的中文写作建议。如果用户没有指定具体要求，默认进行润色和改写。"""

    parameters = [
        ToolParameter(
            name="style",
            type="string",
            description="写作风格",
            required=False,
            default="formal",
            enum=["formal", "casual", "academic", "creative"],
        ),
    ]

    async def handle(
        self,
        messages: list[dict[str, str]],
        params: dict[str, Any] | None = None,
    ) -> AsyncIterator[str]:
        """Handle writing request."""
        style = (params or {}).get("style", "formal")

        style_map = {
            "formal": "正式、专业",
            "casual": "轻松、口语化",
            "academic": "学术、严谨",
            "creative": "创意、生动",
        }

        style_desc = style_map.get(style, "正式、专业")

        # Enhance system prompt with style
        enhanced_prompt = f"{self.system_prompt}\n\n当前要求的写作风格：{style_desc}"

        # Stream response using LLM service
        async for chunk in stream_chat(
            messages=messages,
            system_prompt=enhanced_prompt,
        ):
            yield chunk
