import type { StateCreator } from 'zustand';

import type { AuthUser } from '@/src/features/auth/types';

export type AuthSlice = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setCredentials: (payload: { accessToken: string; user: AuthUser }) => void;
  logout: () => void;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setCredentials: ({ accessToken, user }) =>
    set(() => ({
      accessToken,
      user,
      isAuthenticated: true,
    })),
  logout: () =>
    set(() => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    })),
});

