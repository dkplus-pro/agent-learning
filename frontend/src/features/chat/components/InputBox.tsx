import { Button, Input, Message } from '@arco-design/web-react';
import { IconSend, IconLoading } from '@arco-design/web-react/icon';
import { useState, useCallback } from 'react';
import { useConversationStore, useMessageStore } from '@/stores';
import { useSSE } from '@/features/chat/hooks';
import { createMessage } from '@/api/message';

export default function InputBox() {
  const [message, setMessage] = useState('');
  const { activeConversationId, updateConversation } = useConversationStore();
  const { addMessage, appendToMessage, updateMessage } = useMessageStore();

  const onChunk = useCallback(
    (conversationId: string, messageId: string, content: string) => {
      appendToMessage(conversationId, messageId, content);
    },
    [appendToMessage]
  );

  const onDone = useCallback(
    (conversationId: string, messageId: string) => {
      updateMessage(conversationId, messageId, { status: 'complete' });
    },
    [updateMessage]
  );

  const onTitle = useCallback(
    (conversationId: string, title: string) => {
      updateConversation(conversationId, { title });
    },
    [updateConversation]
  );

  const onError = useCallback((error: string) => {
    Message.error(`发送失败: ${error}`);
  }, []);

  const { sendMessage, isStreaming } = useSSE(onChunk, onDone, onTitle, onError);

  const handleSend = async () => {
    if (!message.trim() || !activeConversationId || isStreaming) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');

    try {
      // Add user message to UI immediately
      const userMsg = await createMessage(activeConversationId, 'user', userMessage);
      addMessage(activeConversationId, userMsg);

      // Add placeholder for assistant message
      const assistantMsg = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId,
        role: 'assistant' as const,
        content: '',
        status: 'complete' as const,
        created_at: new Date().toISOString(),
      };
      addMessage(activeConversationId, assistantMsg);

      // Start streaming
      await sendMessage(activeConversationId, userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      Message.error('发送消息失败');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <Input.TextArea
          value={message}
          onChange={setMessage}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming
              ? 'AI 正在回复中...'
              : '输入消息... (Enter 发送, Shift+Enter 换行)'
          }
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="flex-1"
          disabled={isStreaming}
        />
        <Button
          type="primary"
          icon={isStreaming ? <IconLoading /> : <IconSend />}
          onClick={handleSend}
          disabled={!message.trim() || isStreaming}
          loading={isStreaming}
        />
      </div>
    </div>
  );
}
