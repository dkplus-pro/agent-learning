import { useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Spin } from '@arco-design/web-react';
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
        <Spin />
      </div>
    );
  }

  if (conversationMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">还没有消息，开始对话吧！</div>
      </div>
    );
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      className="h-full"
      data={conversationMessages}
      followOutput="smooth"
      itemContent={(index, message) => (
        <div
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } px-4 py-2`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      )}
    />
  );
}
