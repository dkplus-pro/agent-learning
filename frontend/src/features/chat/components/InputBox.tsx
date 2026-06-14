import { Button, Input, Message, Upload } from '@arco-design/web-react';
import { IconSend, IconLoading, IconAttachment } from '@arco-design/web-react/icon';
import { useState, useCallback, useRef } from 'react';
import { useConversationStore, useMessageStore } from '@/stores';
import { useSSE, useAttachment } from '@/features/chat/hooks';
import { createMessage } from '@/api/message';
import ToolSelector from './ToolSelector';
import VoiceButton from './VoiceButton';
import AttachmentPreview from './AttachmentPreview';

/**
 * 输入框组件 — 聊天消息输入区域，集成工具栏（工具选择、语音输入、附件上传）。
 * 支持 Enter 发送 / Shift+Enter 换行；发送时先创建用户消息，再通过 SSE 流式获取 AI 回复。
 * 使用临时 ID 追踪流式消息，完成后替换为服务端返回的真实 ID。
 */
export default function InputBox() {
  const [message, setMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { activeConversationId, updateConversation } = useConversationStore();
  const { addMessage, appendToMessage, updateMessage } = useMessageStore();
  const { attachments, addAttachment, removeAttachment, clearAttachments } = useAttachment();

  // 用 ref 追踪临时 AI 消息 ID，以便 SSE chunk 追加内容
  const tempMessageIdRef = useRef<string | null>(null);

  const onChunk = useCallback(
    (conversationId: string, _messageId: string, content: string) => {
      // 通过 ref 获取临时 ID，将 SSE 片段追加到 AI 消息中
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
        // 流式传输完成：将临时 ID 替换为服务端真实 ID
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
      // SSE 返回对话标题时更新 store
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
    // 空消息或无活跃对话或正在流式传输时不发送
    if (!message.trim() || !activeConversationId || isStreaming) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    clearAttachments();

    try {
      // 先创建用户消息并立即展示到 UI
      const userMsg = await createMessage(activeConversationId, 'user', userMessage);
      addMessage(activeConversationId, userMsg);

      // 创建临时占位 AI 消息（流式内容将逐字填充）
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
