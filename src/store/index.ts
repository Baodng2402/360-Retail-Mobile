import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

import type { AuthSlice } from './slices/authSlice';
import { createAuthSlice } from './slices/authSlice';

type StoreState = AuthSlice;

const mmkv = new MMKV();

const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkv.delete(name);
  },
};

export const useAppStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
      }),
      {
        name: 'app-store',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
        }),
      },
    ),
  ),
);

