import { List } from '@arco-design/web-react';
import { useConversationStore } from '@/stores';
import ConversationItem from './ConversationItem';

export default function ConversationList() {
  const { conversations, activeConversationId, setActiveConversation } =
    useConversationStore();

  return (
    <List
      dataSource={conversations}
      render={(conversation) => (
        <List.Item
          key={conversation.id}
          className={`cursor-pointer hover:bg-gray-50 ${
            activeConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
          onClick={() => setActiveConversation(conversation.id)}
        >
          <ConversationItem conversation={conversation} />
        </List.Item>
      )}
    />
  );
}
