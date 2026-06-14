import { useState, useCallback } from 'react';

// In development, use the backend URL directly
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

          // Append new data to buffer (handle partial SSE frames)
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events (separated by \n\n)
          const parts = buffer.split('\n\n');
          // The last part may be incomplete — keep it in buffer
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;

            try {
              const event: SSEEvent = JSON.parse(part.slice(6));

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
