import { Button, Input, Message, Upload } from '@arco-design/web-react';
import { IconSend, IconLoading, IconAttachment } from '@arco-design/web-react/icon';
import { useState, useCallback } from 'react';
import { useConversationStore, useMessageStore } from '@/stores';
import { useSSE, useAttachment } from '@/features/chat/hooks';
import { createMessage } from '@/api/message';
import ToolSelector from './ToolSelector';
import VoiceButton from './VoiceButton';
import AttachmentPreview from './AttachmentPreview';

export default function InputBox() {
  const [message, setMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { activeConversationId, updateConversation } = useConversationStore();
  const { addMessage, appendToMessage, updateMessage } = useMessageStore();
  const { attachments, addAttachment, removeAttachment, clearAttachments } = useAttachment();

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

  const handleVoiceTranscription = useCallback((text: string) => {
    setMessage((prev) => (prev ? prev + ' ' + text : text));
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !activeConversationId || isStreaming) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    clearAttachments();

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

      // Start streaming with optional tool
      await sendMessage(activeConversationId, userMessage, selectedTool || undefined);
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
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
      <div className="flex items-end gap-2 mb-2">
        <ToolSelector
          value={selectedTool}
          onChange={setSelectedTool}
          disabled={isStreaming}
        />
        <VoiceButton
          onTranscriptionComplete={handleVoiceTranscription}
          disabled={isStreaming}
        />
        <Upload
          autoUpload={false}
          showUploadList={false}
          onChange={(fileList) => {
            if (fileList.length > 0) {
              addAttachment(fileList[fileList.length - 1].file);
            }
          }}
        >
          <Button icon={<IconAttachment />} disabled={isStreaming} />
        </Upload>
      </div>
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
