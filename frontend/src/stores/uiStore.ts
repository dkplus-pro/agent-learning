import { create } from 'zustand';

/**
 * UI 状态管理 Store
 *
 * 管理侧边栏折叠等全局 UI 状态。
 */
interface UIState {
  sidebarCollapsed: boolean;
  /** 切换侧边栏展开/折叠状态 */
  toggleSidebar: () => void;
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/** UI 状态 Hook —— 基于 Zustand 的状态管理 */
export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
