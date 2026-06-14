import { Button, Input, Message, Upload } from '@arco-design/web-react';
import { IconSend, IconLoading, IconAttachment } from '@arco-design/web-react/icon';
import { useState, useCallback, useRef } from 'react';
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

  // Track the temp assistant message ID so chunks can append to it
  const tempMessageIdRef = useRef<string | null>(null);

  const onChunk = useCallback(
    (conversationId: string, _messageId: string, content: string) => {
      // Use the temp ID tracked via ref, not the empty string from useSSE
      const targetId = tempMessageIdRef.current;
      if (targetId) {
        appendToMessage(conversationId, targetId, content);
      }
    },
    [appendToMessage]
  );

  const onDone = useCallback(
    (conversationId: string, serverMessageId: string) => {
      const tempId = tempMessageIdRef.current;
      if (tempId) {
        // Replace temp ID with the real server ID
        updateMessage(conversationId, tempId, {
          id: serverMessageId,
          status: 'complete',
        });
      }
      tempMessageIdRef.current = null;
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
    tempMessageIdRef.current = null;
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

      // Add placeholder for assistant message with temp ID
      const tempId = `temp-${Date.now()}`;
      tempMessageIdRef.current = tempId;

      const assistantMsg = {
        id: tempId,
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
      tempMessageIdRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="p-5"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
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
              const lastFile = fileList[fileList.length - 1];
              if (lastFile.originFile) {
                addAttachment(lastFile.originFile);
              }
            }
          }}
        >
          <Button
            type="text"
            icon={<IconAttachment style={{ fontSize: 18 }} />}
            disabled={isStreaming}
            style={{ color: 'var(--color-muted-foreground)' }}
            className="hover:bg-[var(--color-muted)] transition-colors"
          />
        </Upload>
      </div>

      {/* Input Area */}
      <div
        className="flex items-end gap-3 p-3 rounded-xl transition-all"
        style={{
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
        }}
      >
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
          className="flex-1 chat-input-no-focus"
          disabled={isStreaming}
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            color: 'var(--color-foreground)',
            fontSize: 'var(--text-base)',
          }}
        />
        <Button
          type="primary"
          icon={isStreaming ? <IconLoading /> : <IconSend />}
          onClick={handleSend}
          disabled={!message.trim() || isStreaming}
          loading={isStreaming}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: message.trim() && !isStreaming
              ? 'var(--gradient-primary)'
              : 'var(--color-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            minWidth: 40,
            height: 40,
            transition: 'all var(--duration-base) var(--ease-default)',
          }}
          className={message.trim() && !isStreaming ? 'hover:opacity-90 shadow-md' : ''}
        />
      </div>

      {/* Helper Text */}
      <div
        className="text-xs mt-2 text-center"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        Enter 发送 · Shift+Enter 换行
      </div>
    </div>
  );
}
