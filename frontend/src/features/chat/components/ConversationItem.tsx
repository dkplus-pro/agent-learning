import { Button, Popconfirm } from '@arco-design/web-react';
import { IconDelete, IconEdit } from '@arco-design/web-react/icon';
import type { Conversation } from '@/types/api';
import { useConversationStore } from '@/stores';
import { deleteConversation } from '@/api/conversation';

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const { removeConversation, setActiveConversation } = useConversationStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(conversation.id);
      removeConversation(conversation.id);
      setActiveConversation(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="flex items-center justify-between w-full py-2">
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{conversation.title}</div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(conversation.updated_at).toLocaleString()}
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        <Button
          type="text"
          size="mini"
          icon={<IconEdit />}
          onClick={(e) => e.stopPropagation()}
        />
        <Popconfirm
          title="确定删除此对话？"
          onOk={handleDelete}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button
            type="text"
            size="mini"
            status="danger"
            icon={<IconDelete />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </div>
    </div>
  );
}
