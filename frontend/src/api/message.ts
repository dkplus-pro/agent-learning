import client from './client';
import type { Message } from '@/types/api';

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data } = await client.GET('/api/messages/{conversation_id}', {
    params: { path: { conversation_id: conversationId } },
  });
  return data || [];
}

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const { data } = await client.POST('/api/messages/', {
    body: {
      conversation_id: conversationId,
      role,
      content,
    },
  });
  return data!;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await client.DELETE('/api/messages/{message_id}', {
    params: { path: { message_id: messageId } },
  });
}
