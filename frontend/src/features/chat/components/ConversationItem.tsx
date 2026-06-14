import { Button, Input, Popconfirm } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconCheck, IconClose } from '@arco-design/web-react/icon';
import { useState } from 'react';
import type { Conversation } from '@/types/api';
import { useConversationStore } from '@/stores';
import { deleteConversation, updateConversation } from '@/api/conversation';

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const { removeConversation, setActiveConversation, updateConversation: updateStore } =
    useConversationStore();

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditing(false);
      return;
    }
    try {
      const updated = await updateConversation(conversation.id, editTitle.trim());
      updateStore(conversation.id, { title: updated.title });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setEditTitle(conversation.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave(e as any);
    } else if (e.key === 'Escape') {
      handleCancel(e as any);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 w-full py-2">
        <Input
          value={editTitle}
          onChange={setEditTitle}
          onKeyDown={handleKeyDown}
          size="small"
          autoFocus
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          type="text"
          size="mini"
          icon={<IconCheck />}
          onClick={handleSave}
        />
        <Button
          type="text"
          size="mini"
          icon={<IconClose />}
          onClick={handleCancel}
        />
      </div>
    );
  }

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
          onClick={handleEdit}
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
