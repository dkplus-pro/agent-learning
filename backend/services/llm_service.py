"""LLM 服务层，用于流式聊天响应。"""

import asyncio
from typing import AsyncIterator

from dashscope import Generation

from config import settings


def _sync_stream(messages, system_prompt=None):
    """
    同步生成器，从 DashScope API 逐块产出数据。

    由 stream_chat() 通过 run_in_executor 包装调用，使得每个数据块
    都能将控制权交还给异步事件循环。
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
    从 DashScope API 流式获取聊天响应。

    在线程执行器中运行同步的 DashScope SDK 调用，每个 token 到达时即产出，
    不会阻塞异步事件循环。

    同步生成器耗尽时产生的 StopIteration 会在线程函数内部捕获，以避免
    Python 抛出 "StopIteration cannot be raised into a Future" 错误，
    该错误会静默终止调用方。
    """
    loop = asyncio.get_running_loop()
    gen = _sync_stream(messages, system_prompt)

    # Must NOT pass next(gen) directly to run_in_executor —
    # StopIteration from an exhausted generator crashes the Future.
    def _next_chunk():
        """从同步流中返回下一个数据块，若已耗尽则返回 None。"""
        try:
            return next(gen)
        except StopIteration:
            return None

    while True:
        chunk = await loop.run_in_executor(None, _next_chunk)
        if chunk is None:
            break
        yield chunk
