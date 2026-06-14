import { create } from 'zustand';
import type { Message } from '@/types/api';

/**
 * 消息状态管理 Store
 *
 * 以 conversationId 为 key 管理各对话的消息列表，支持增删改及流式追加。
 */
interface MessageState {
  messages: Record<string, Message[]>;
  /** 设置指定对话的消息列表 */
  setMessages: (conversationId: string, messages: Message[]) => void;
  /** 向指定对话追加一条消息 */
  addMessage: (conversationId: string, message: Message) => void;
  /** 更新指定对话中的某条消息 */
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  /** 删除指定对话中的某条消息 */
  removeMessage: (conversationId: string, messageId: string) => void;
  /** 向指定消息的内容末尾追加文本（用于流式输出） */
  appendToMessage: (
    conversationId: string,
    messageId: string,
    content: string
  ) => void;
}

/** 消息状态 Hook —— 基于 Zustand 的状态管理 */
export const useMessageStore = create<MessageState>((set) => ({
  messages: {},

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (msg) => msg.id !== messageId
        ),
      },
    })),

  appendToMessage: (conversationId, messageId, content) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, content: msg.content + content } : msg
        ),
      },
    })),
}));
