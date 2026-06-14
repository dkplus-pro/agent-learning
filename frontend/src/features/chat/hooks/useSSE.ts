import { useState, useCallback } from 'react';

// 开发环境直接使用后端 URL
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : '';

interface UseSSEResult {
  sendMessage: (
    conversationId: string,
    message: string,
    toolId?: string,
    toolParams?: Record<string, any>
  ) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
}

interface SSEEvent {
  type: 'chunk' | 'title' | 'done' | 'error';
  content?: string;
  title?: string;
  message_id?: string;
  message?: string;
}

/**
 * 使用 SSE（Server-Sent Events）流式消费后端响应的 Hook。
 * 通过 fetch 读取流式数据，按 SSE 协议解析事件（chunk/title/done/error），
 * 并分别回调对应的处理函数，实现打字机效果的实时消息展示。
 *
 * @param onChunk   - 收到文本片段时的回调
 * @param onDone    - 流式传输完成时的回调
 * @param onTitle   - 收到对话标题更新时的回调
 * @param onError   - 发生错误时的回调
 * @returns 包含 sendMessage 方法、isStreaming 状态和 error 信息
 */
export function useSSE(
  onChunk: (conversationId: string, messageId: string, content: string) => void,
  onDone: (conversationId: string, messageId: string) => void,
  onTitle: (conversationId: string, title: string) => void,
  onError: (error: string) => void
): UseSSEResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      conversationId: string,
      message: string,
      toolId?: string,
      toolParams?: Record<string, any>
    ) => {
      setIsStreaming(true);
      setError(null);

      let messageId = '';

      try {
        // 向 SSE 流端点发送 POST 请求
        const response = await fetch(`${baseUrl}/api/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            message,
            tool_id: toolId,
            tool_params: toolParams,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 将新数据追加到缓冲区（处理不完整的 SSE 帧）
          buffer += decoder.decode(value, { stream: true });

          // 处理完整的 SSE 事件（以 \n\n 分隔）
          const parts = buffer.split('\n\n');
          // 最后一部分可能不完整，保留在缓冲区中
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;

            try {
              const event: SSEEvent = JSON.parse(part.slice(6));

              // 根据事件类型分发到不同的回调
              switch (event.type) {
                case 'chunk':
                  if (event.content) {
                    onChunk(conversationId, messageId, event.content);
                  }
                  break;
                case 'title':
                  if (event.title) {
                    onTitle(conversationId, event.title);
                  }
                  break;
                case 'done':
                  if (event.message_id) {
                    messageId = event.message_id;
                    onDone(conversationId, messageId);
                  }
                  break;
                case 'error':
                  if (event.message) {
                    setError(event.message);
                    onError(event.message);
                  }
                  break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsStreaming(false);
      }
    },
    [onChunk, onDone, onTitle, onError]
  );

  return { sendMessage, isStreaming, error };
}
