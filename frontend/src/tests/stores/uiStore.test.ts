import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from '@/stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      sidebarCollapsed: false,
    });
  });

  it('should toggle sidebar', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);

    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarCollapsed).toBe(true);

    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('should set sidebar collapsed state', () => {
    act(() => {
      useUIStore.getState().setSidebarCollapsed(true);
    });

    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });
});
