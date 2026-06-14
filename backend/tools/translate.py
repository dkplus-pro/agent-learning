"""Translation tool."""

from typing import Any, AsyncIterator

from services.llm_service import stream_chat
from tools.base import ToolHandler, ToolParameter
from tools.registry import register_tool


@register_tool
class TranslateTool(ToolHandler):
    """Translation tool."""

    name = "translate"
    description = "翻译工具 - 支持多语言翻译"
    system_prompt = """你是一个专业的翻译助手。你的任务是将用户提供的文本准确、流畅地翻译成目标语言。

翻译原则：
- 保持原文的语气和风格
- 使用目标语言的自然表达方式
- 对于专业术语，提供准确的翻译
- 如果原文有歧义，在翻译后添加简短的说明

请只输出翻译结果，不要添加额外的解释（除非原文有歧义需要说明）。"""

    parameters = [
        ToolParameter(
            name="target_lang",
            type="string",
            description="目标语言",
            required=True,
            default="en",
            enum=["en", "zh", "ja", "ko", "fr", "de", "es"],
        ),
    ]

    async def handle(
        self,
        messages: list[dict[str, str]],
        params: dict[str, Any] | None = None,
    ) -> AsyncIterator[str]:
        """Handle translation request."""
        target_lang = (params or {}).get("target_lang", "en")

        lang_map = {
            "en": "英语",
            "zh": "中文",
            "ja": "日语",
            "ko": "韩语",
            "fr": "法语",
            "de": "德语",
            "es": "西班牙语",
        }

        lang_name = lang_map.get(target_lang, "英语")

        # Enhance system prompt with target language
        enhanced_prompt = f"{self.system_prompt}\n\n目标语言：{lang_name}"

        # Stream response using LLM service
        async for chunk in stream_chat(
            messages=messages,
            system_prompt=enhanced_prompt,
        ):
            yield chunk
