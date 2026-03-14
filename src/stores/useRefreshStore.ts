import React from 'react';
import { create } from 'zustand';

/**
 * =============================================
 * Refresh Store — Centralized Data Sync Orchestrator
 * 
 * Khi subscription/store thay đổi → trigger global refetch
 * Tất cả screens subscribe vào store này → get updates
 * =============================================
 */

export type RefreshTrigger = 'subscription' | 'store' | 'profile' | 'manual';

interface RefreshState {
  // Timestamp — khi refresh được trigger
  lastRefreshTime: Record<RefreshTrigger, number>;
  isRefreshing: RefreshTrigger | null;

  // Actions
  triggerRefresh: (trigger: RefreshTrigger) => void;
  setRefreshing: (trigger: RefreshTrigger | null) => void;
  getLastRefreshTime: (trigger: RefreshTrigger) => number;
}

export const useRefreshStore = create<RefreshState>((set, get) => ({
  lastRefreshTime: {
    subscription: 0,
    store: 0,
    profile: 0,
    manual: 0,
  },
  isRefreshing: null,

  // Trigger refresh cho một source — tất cả screens watching sẽ biết
  triggerRefresh: (trigger: RefreshTrigger) => {
    const now = Date.now();
    set((state) => ({
      lastRefreshTime: {
        ...state.lastRefreshTime,
        [trigger]: now,
      },
    }));
    console.log(`[RefreshStore] Triggered refresh for: ${trigger} at ${new Date(now).toISOString()}`);
  },

  // Track which source is currently refreshing
  setRefreshing: (trigger: RefreshTrigger | null) => {
    set({ isRefreshing: trigger });
  },

  // Get last refresh time for dependency check
  getLastRefreshTime: (trigger: RefreshTrigger) => {
    return get().lastRefreshTime[trigger];
  },
}));


export function useRefreshOnSubscriptionChange(callback: () => Promise<void>) {
  const lastTime = useRefreshStore((s) => s.lastRefreshTime.subscription);

  // Trigger callback mỗi khi subscription refresh được trigger
  React.useEffect(() => {
    if (lastTime > 0) {
      // Debounce: đợi 300ms trước khi trigger
      const timer = setTimeout(async () => {
        try {
          console.log('[useRefreshOnSubscriptionChange] Executing callback...');
          await callback();
        } catch (err) {
          console.error('[useRefreshOnSubscriptionChange] Error:', err);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [lastTime]);
}
export function useRefreshOnStoreChange(callback: () => Promise<void>) {
  const lastTime = useRefreshStore((s) => s.lastRefreshTime.store);

  React.useEffect(() => {
    if (lastTime > 0) {
      const timer = setTimeout(async () => {
        try {
          console.log('[useRefreshOnStoreChange] Executing callback...');
          await callback();
        } catch (err) {
          console.error('[useRefreshOnStoreChange] Error:', err);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [lastTime]);
}
