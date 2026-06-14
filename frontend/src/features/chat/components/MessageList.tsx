import { useEffect } from 'react';
import { Spin } from '@arco-design/web-react';
import { useConversationStore, useMessageStore } from '@/stores';
import { fetchMessages } from '@/api/message';

export default function MessageList() {
  const { activeConversationId } = useConversationStore();
  const { messages, setMessages } = useMessageStore();

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
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {conversationMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
