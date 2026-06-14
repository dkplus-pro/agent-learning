import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useMessageStore } from '@/stores/messageStore';

describe('messageStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMessageStore.setState({
      messages: {},
    });
  });

  it('should add a message to a conversation', () => {
    const message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user' as const,
      content: 'Hello',
      status: 'complete' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      useMessageStore.getState().addMessage('conv-1', message);
    });

    const { messages } = useMessageStore.getState();
    expect(messages['conv-1']).toHaveLength(1);
    expect(messages['conv-1'][0].content).toBe('Hello');
  });

  it('should append content to a message', () => {
    const message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'assistant' as const,
      content: 'Hello',
      status: 'complete' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      useMessageStore.getState().addMessage('conv-1', message);
      useMessageStore.getState().appendToMessage('conv-1', 'msg-1', ' World');
    });

    const { messages } = useMessageStore.getState();
    expect(messages['conv-1'][0].content).toBe('Hello World');
  });

  it('should update a message', () => {
    const message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'assistant' as const,
      content: 'Hello',
      status: 'complete' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      useMessageStore.getState().addMessage('conv-1', message);
      useMessageStore.getState().updateMessage('conv-1', 'msg-1', { status: 'interrupted' });
    });

    const { messages } = useMessageStore.getState();
    expect(messages['conv-1'][0].status).toBe('interrupted');
  });

  it('should remove a message', () => {
    const message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user' as const,
      content: 'Hello',
      status: 'complete' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      useMessageStore.getState().addMessage('conv-1', message);
      useMessageStore.getState().removeMessage('conv-1', 'msg-1');
    });

    const { messages } = useMessageStore.getState();
    expect(messages['conv-1']).toHaveLength(0);
  });

  it('should set messages for a conversation', () => {
    const messages = [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        role: 'user' as const,
        content: 'Hello',
        status: 'complete' as const,
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        role: 'assistant' as const,
        content: 'Hi there',
        status: 'complete' as const,
        created_at: new Date().toISOString(),
      },
    ];

    act(() => {
      useMessageStore.getState().setMessages('conv-1', messages);
    });

    const { messages: storeMessages } = useMessageStore.getState();
    expect(storeMessages['conv-1']).toHaveLength(2);
  });
});
