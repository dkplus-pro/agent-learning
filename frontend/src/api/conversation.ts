import client from './client';
import type { Conversation } from '@/types/api';

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await client.GET('/api/conversations/');
  return data || [];
}

export async function createConversation(
  title?: string
): Promise<Conversation> {
  const { data } = await client.POST('/api/conversations/', {
    body: { title: title || '新对话' },
  });
  return data!;
}

export async function updateConversation(
  id: string,
  title: string
): Promise<Conversation> {
  const { data } = await client.PATCH('/api/conversations/{conversation_id}', {
    params: { path: { conversation_id: id } },
    body: { title },
  });
  return data!;
}

export async function deleteConversation(id: string): Promise<void> {
  await client.DELETE('/api/conversations/{conversation_id}', {
    params: { path: { conversation_id: id } },
  });
}
