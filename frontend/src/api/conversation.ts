import client from './client';
import type { Conversation } from '@/types/api';

/** 获取所有对话列表 */
export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await client.GET('/api/conversations/');
  return data || [];
}

/** 创建新对话，可选传入标题 */
export async function createConversation(
  title?: string
): Promise<Conversation> {
  const { data } = await client.POST('/api/conversations/', {
    body: { title: title || '新对话' },
  });
  return data!;
}

/** 更新指定对话的标题 */
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

/** 删除指定对话 */
export async function deleteConversation(id: string): Promise<void> {
  await client.DELETE('/api/conversations/{conversation_id}', {
    params: { path: { conversation_id: id } },
  });
}
