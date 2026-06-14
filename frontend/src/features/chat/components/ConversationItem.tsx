import { Button, Input, Popconfirm } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconCheck, IconClose, IconMessage } from '@arco-design/web-react/icon';
import { useState } from 'react';
import type { Conversation } from '@/types/api';
import { useConversationStore } from '@/stores';
import { deleteConversation, updateConversation } from '@/api/conversation';

interface Props {
  conversation: Conversation;
  isActive?: boolean;
}

export default function ConversationItem({ conversation, isActive = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const { removeConversation, setActiveConversation, updateConversation: updateStore } =
    useConversationStore();

  const handleDelete = async () => {
    try {
      await deleteConversation(conversation.id);
      removeConversation(conversation.id);
      setActiveConversation(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSave = async () => {
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

  const handleCancel = () => {
    setEditing(false);
    setEditTitle(conversation.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 w-full px-3 py-2">
        <Input
          value={editTitle}
          onChange={setEditTitle}
          onKeyDown={handleKeyDown}
          size="small"
          autoFocus
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
          style={{
            borderColor: 'var(--color-ring)',
            boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
          }}
        />
        <Button
          type="text"
          size="mini"
          icon={<IconCheck />}
          onClick={handleSave}
          style={{ color: 'var(--color-accent)' }}
        />
        <Button
          type="text"
          size="mini"
          icon={<IconClose />}
          onClick={handleCancel}
          style={{ color: 'var(--color-muted-foreground)' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
        isActive
          ? 'bg-[#F1F5FD]'
          : 'hover:bg-[#F8FAFC]'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <IconMessage
          style={{
            fontSize: 16,
            color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
            flexShrink: 0,
          }}
        />
        <div className="flex-1 min-w-0">
          <div
            className={`truncate text-sm font-medium ${
              isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'
            }`}
          >
            {conversation.title}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {new Date(conversation.updated_at).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="text"
          size="mini"
          icon={<IconEdit style={{ fontSize: 14 }} />}
          onClick={handleEdit}
          style={{ color: 'var(--color-muted-foreground)' }}
          className="hover:color-[var(--color-primary)]"
        />
        <Popconfirm
          title="确定删除此对话？"
          onOk={handleDelete}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button
            type="text"
            size="mini"
            icon={<IconDelete style={{ fontSize: 14 }} />}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--color-destructive)' }}
          />
        </Popconfirm>
      </div>
    </div>
  );
}
