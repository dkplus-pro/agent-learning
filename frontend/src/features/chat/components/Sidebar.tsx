import { Button, Layout } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useState, useEffect } from 'react';
import { useConversationStore } from '@/stores';
import { fetchConversations, createConversation } from '@/api/conversation';
import ConversationList from './ConversationList';

const { Sider } = Layout;

export default function Sidebar() {
  const [loading, setLoading] = useState(false);
  const {
    conversations,
    setConversations,
    addConversation,
    setActiveConversation,
  } = useConversationStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleNewConversation = async () => {
    setLoading(true);
    try {
      const conversation = await createConversation();
      addConversation(conversation);
      setActiveConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sider
      width={280}
      className="flex flex-col border-r border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">对话</h2>
        <Button
          type="primary"
          icon={<IconPlus />}
          size="small"
          loading={loading}
          onClick={handleNewConversation}
        >
          新对话
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </Sider>
  );
}
