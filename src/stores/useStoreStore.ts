import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeApi } from '@/src/api/store.api';
import { useAuthStore } from './useAuthStore';
import type { Store } from '@/src/types';

// =============================================
// Store Store — Zustand
// Quản lý danh sách cửa hàng + active store
// Usage: const { activeStore, switchStore } = useStoreStore()
// =============================================

interface StoreState {
  stores: Store[];
  activeStore: Store | null;
  isLoading: boolean;
  isSwitching: boolean;

  // Actions
  fetchStores: () => Promise<void>;
  switchStore: (storeId: string) => Promise<boolean>;
  setActiveStore: (store: Store) => void;
  clear: () => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  activeStore: null,
  isLoading: false,
  isSwitching: false,

  // Lấy store hiện tại + danh sách stores sở hữu
  fetchStores: async () => {
    set({ isLoading: true });
    try {
      // 1. Lấy store hiện tại từ JWT store_id claim
      const currentRes = await storeApi.getCurrentStore();
      const currentStore: Store | null = currentRes.data?.data || currentRes.data || null;

      // 2. Thử lấy DS stores sở hữu (Owner only — sẽ lỗi 403 nếu Staff)
      let ownedStores: Store[] = [];
      try {
        const ownedRes = await storeApi.getMyOwnedStores();
        const rawOwned = ownedRes.data?.data || ownedRes.data;
        ownedStores = Array.isArray(rawOwned) ? rawOwned : [];
      } catch {
        // Staff role → chỉ có current store
      }

      // Nếu có owned stores → dùng list đó, nếu không → dùng current store
      const storeList = ownedStores.length > 0 ? ownedStores : currentStore ? [currentStore] : [];

      set({
        stores: storeList,
        activeStore: currentStore || storeList[0] || null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Switch store context → gọi refresh-access → token mới
  switchStore: async (storeId: string) => {
    const { stores } = get();
    set({ isSwitching: true });
    try {
      const res = await storeApi.switchStore(storeId);
      const data = res.data?.data || res.data;
      const newToken = data?.accessToken || data?.token;

      if (newToken) {
        // Lưu token mới → auth store decode lại claims
        await AsyncStorage.setItem('accessToken', newToken);
        const authState = useAuthStore.getState();
        await authState.login(newToken, authState.user!);
      }

      // Cập nhật active store
      const targetStore = stores.find((s) => s.id === storeId);
      if (targetStore) {
        set({ activeStore: targetStore, isSwitching: false });
      } else {
        set({ isSwitching: false });
      }
      return true;
    } catch {
      set({ isSwitching: false });
      return false;
    }
  },

  setActiveStore: (store) => set({ activeStore: store }),

  clear: () => set({ stores: [], activeStore: null, isLoading: false, isSwitching: false }),
}));
