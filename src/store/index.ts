import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import type { AuthSlice } from './slices/authSlice';
import { createAuthSlice } from './slices/authSlice';

type StoreState = AuthSlice;

const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
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
        storage: createJSONStorage(() => asyncStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
        }),
      },
    ),
  ),
);

