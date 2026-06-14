import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useConversationStore } from '@/stores/conversationStore';

describe('conversationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useConversationStore.setState({
      conversations: [],
      activeConversationId: null,
    });
  });

  it('should add a conversation', () => {
    const conversation = {
      id: 'conv-1',
      title: '测试对话',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    act(() => {
      useConversationStore.getState().addConversation(conversation);
    });

    const { conversations } = useConversationStore.getState();
    expect(conversations).toHaveLength(1);
    expect(conversations[0].title).toBe('测试对话');
  });

  it('should update a conversation title', () => {
    const conversation = {
      id: 'conv-1',
      title: '原标题',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    act(() => {
      useConversationStore.getState().addConversation(conversation);
      useConversationStore.getState().updateConversation('conv-1', { title: '新标题' });
    });

    const { conversations } = useConversationStore.getState();
    expect(conversations[0].title).toBe('新标题');
  });

  it('should remove a conversation', () => {
    const conversation = {
      id: 'conv-1',
      title: '测试对话',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    act(() => {
      useConversationStore.getState().addConversation(conversation);
      useConversationStore.getState().removeConversation('conv-1');
    });

    const { conversations } = useConversationStore.getState();
    expect(conversations).toHaveLength(0);
  });

  it('should set active conversation', () => {
    act(() => {
      useConversationStore.getState().setActiveConversation('conv-1');
    });

    const { activeConversationId } = useConversationStore.getState();
    expect(activeConversationId).toBe('conv-1');
  });

  it('should clear active conversation when removing active', () => {
    const conversation = {
      id: 'conv-1',
      title: '测试对话',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    act(() => {
      useConversationStore.getState().addConversation(conversation);
      useConversationStore.getState().setActiveConversation('conv-1');
      useConversationStore.getState().removeConversation('conv-1');
    });

    const { activeConversationId } = useConversationStore.getState();
    expect(activeConversationId).toBeNull();
  });
});
