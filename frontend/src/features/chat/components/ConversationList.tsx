import { Empty } from '@arco-design/web-react';
import { IconMessage } from '@arco-design/web-react/icon';
import { useConversationStore } from '@/stores';
import ConversationItem from './ConversationItem';

/**
 * 对话列表组件 — 渲染当前所有对话的列表项。
 * 无对话时显示空状态提示；有对话时点击每一项可切换活跃对话。
 */
export default function ConversationList() {
  const { conversations, activeConversationId, setActiveConversation } =
    useConversationStore();

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 px-4">
        <Empty
          icon={<IconMessage style={{ fontSize: 32, color: 'var(--color-muted-foreground)' }} />}
          description={<div style={{ color: 'var(--color-muted-foreground)' }}>暂无对话</div>}
        />
      </div>
    );
  }

  return (
    <div className="px-2 space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => setActiveConversation(conversation.id)}
          className="transition-all"
        >
          <ConversationItem
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
          />
        </div>
      ))}
    </div>
  );
}
