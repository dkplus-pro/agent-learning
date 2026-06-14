"""LLM service layer for streaming chat responses."""

from typing import AsyncIterator

from dashscope import Generation

from config import settings


async def stream_chat(
    messages: list[dict[str, str]],
    system_prompt: str | None = None,
) -> AsyncIterator[str]:
    """
    Stream chat responses from DashScope API.

    Args:
        messages: Conversation history [{"role": "user", "content": "..."}]
        system_prompt: Optional system prompt to prepend

    Yields:
        Text chunks from the LLM response
    """
    # Build message list with optional system prompt
    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)

    # Call DashScope API with streaming
    responses = Generation.call(
        api_key=settings.aliyun_dashscope_api_key,
        model=settings.text_model,
        messages=full_messages,
        result_format="message",
        stream=True,
        incremental_output=True,
    )

    # Stream response chunks
    for response in responses:
        if response.status_code == 200:
            content = response.output.choices[0].message.content
            if content:
                yield content
        else:
            # Handle error
            error_msg = f"API Error: {response.code} - {response.message}"
            yield f"[{error_msg}]"
            break
