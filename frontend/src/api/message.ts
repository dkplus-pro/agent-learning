import client from './client';
import type { Message } from '@/types/api';

/** 获取指定对话的所有消息 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data } = await client.GET('/api/messages/{conversation_id}', {
    params: { path: { conversation_id: conversationId } },
  });
  return data || [];
}

/** 创建一条新消息（用户或助手角色） */
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

/** 删除指定消息 */
export async function deleteMessage(messageId: string): Promise<void> {
  await client.DELETE('/api/messages/{message_id}', {
    params: { path: { message_id: messageId } },
  });
}
