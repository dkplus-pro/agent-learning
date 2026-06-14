"""LLM service layer for streaming chat responses."""

import asyncio
from typing import AsyncIterator

from dashscope import Generation

from config import settings


def _sync_stream(messages, system_prompt=None):
    """
    Synchronous generator that yields chunks from DashScope API.

    Wrapped by stream_chat() via run_in_executor so each chunk
    yields control back to the async event loop.
    """
    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)

    responses = Generation.call(
        api_key=settings.aliyun_dashscope_api_key,
        model=settings.text_model,
        messages=full_messages,
        result_format="message",
        stream=True,
        incremental_output=True,
    )

    for response in responses:
        if response.status_code == 200:
            content = response.output.choices[0].message.content
            if content:
                yield content
        else:
            error_msg = f"API Error: {response.code} - {response.message}"
            yield f"[{error_msg}]"
            break


async def stream_chat(
    messages: list[dict[str, str]],
    system_prompt: str | None = None,
) -> AsyncIterator[str]:
    """
    Stream chat responses from DashScope API.

    Runs the synchronous DashScope SDK call in a thread executor,
    yielding each token as it arrives without blocking the async event loop.

    StopIteration from the exhausted sync generator is caught inside
    the thread function to avoid the Python "StopIteration cannot be
    raised into a Future" error that would silently kill the caller.
    """
    loop = asyncio.get_running_loop()
    gen = _sync_stream(messages, system_prompt)

    # Must NOT pass next(gen) directly to run_in_executor —
    # StopIteration from an exhausted generator crashes the Future.
    def _next_chunk():
        """Return the next chunk from the sync stream, or None if done."""
        try:
            return next(gen)
        except StopIteration:
            return None

    while True:
        chunk = await loop.run_in_executor(None, _next_chunk)
        if chunk is None:
            break
        yield chunk
