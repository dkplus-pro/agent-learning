import { create } from 'zustand';
import type { Conversation } from '@/types/api';

/**
 * 对话状态管理 Store
 *
 * 管理对话列表、当前活跃对话等状态，提供增删改查及激活操作。
 */
interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  /** 批量设置对话列表 */
  setConversations: (conversations: Conversation[]) => void;
  /** 新增一条对话（插入列表头部） */
  addConversation: (conversation: Conversation) => void;
  /** 更新指定对话的部分字段 */
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  /** 删除指定对话，若为当前活跃对话则一并清除激活状态 */
  removeConversation: (id: string) => void;
  /** 设置当前活跃的对话 ID */
  setActiveConversation: (id: string | null) => void;
}

/** 对话状态 Hook —— 基于 Zustand 的状态管理 */
export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
