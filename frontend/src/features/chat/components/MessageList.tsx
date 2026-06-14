import { useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Spin, Empty } from '@arco-design/web-react';
import { IconMessage } from '@arco-design/web-react/icon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useConversationStore, useMessageStore } from '@/stores';
import { fetchMessages } from '@/api/message';

export default function MessageList() {
  const { activeConversationId } = useConversationStore();
  const { messages, setMessages } = useMessageStore();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages();
    }
  }, [activeConversationId]);

  const loadMessages = async () => {
    if (!activeConversationId) return;

    try {
      const data = await fetchMessages(activeConversationId);
      setMessages(activeConversationId, data);
      // Scroll to bottom after loading
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: data.length - 1,
          align: 'end',
        });
      }, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  if (!activeConversationId) {
    return null;
  }

  const conversationMessages = messages[activeConversationId];

  if (conversationMessages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size={32} />
      </div>
    );
  }

  if (conversationMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Empty
          icon={<IconMessage style={{ fontSize: 48, color: 'var(--color-muted-foreground)' }} />}
          description="还没有消息，开始对话吧！"
        />
      </div>
    );
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      className="h-full"
      data={conversationMessages}
      followOutput="smooth"
      itemContent={(_index, message) => (
        <div
          className={`flex flex-col animate-fadeIn ${
            message.role === 'user' ? 'items-end' : 'items-start'
          } px-6 py-2`}
        >
          <div
            className={`max-w-[70%] rounded-xl px-5 py-3 shadow-sm transition-all ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white rounded-br-md'
                : 'bg-white text-[#0F172A] border border-[#E4ECFC] rounded-bl-md'
            }`}
            style={{
              boxShadow: message.role === 'user'
                ? '0 2px 8px rgba(37, 99, 235, 0.2)'
                : '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none prose-headings:text-[#0F172A] prose-p:text-[#0F172A] prose-a:text-[#2563EB] prose-strong:text-[#0F172A] prose-code:text-[#0F172A] prose-code:bg-[#F1F5FD] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#F8FAFC] prose-pre:border prose-pre:border-[#E4ECFC]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</div>
            )}
          </div>
          <div
            className={`text-xs mt-1 px-1 ${
              message.role === 'user' ? 'text-[#64748B] text-right' : 'text-[#64748B]'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      )}
    />
  );
}
