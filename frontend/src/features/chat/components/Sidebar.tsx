import { Button, Layout } from '@arco-design/web-react';
import { IconPlus, IconRobot } from '@arco-design/web-react/icon';
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
      className="flex flex-col bg-white"
      style={{ borderRight: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <IconRobot style={{ color: 'white', fontSize: 18 }} />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
            Agent Demo
          </h2>
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          size="small"
          loading={loading}
          onClick={handleNewConversation}
          style={{
            background: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
          }}
          className="hover:opacity-90 transition-opacity"
        >
          新对话
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-2">
        <ConversationList />
      </div>

      {/* Footer */}
      <div
        className="p-4 text-center text-xs"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-muted-foreground)',
        }}
      >
        <div className="font-medium">Agent Demo v1.0</div>
        <div className="mt-1">Powered by FastAPI + Modern.js</div>
      </div>
    </Sider>
  );
}
