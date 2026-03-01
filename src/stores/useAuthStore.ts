import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useSubscriptionStore } from './useSubscriptionStore';
import type { UserProfile } from '@/src/types';
// =============================================
// Auth Store — Zustand
// Dùng ở bất kỳ screen nào: const { user } = useAuthStore()
// =============================================

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Đăng nhập — lưu token + user vào AsyncStorage
  login: async (token, user) => {
    let finalUser = user;
    try {
      const decoded: any = jwtDecode(token);

      // .NET WS-Security claim URIs — backend dùng key dài trong JWT
      const CLAIM = {
        ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      };

      // Nếu user backend trả về thiếu thông tin, ta điền từ token claims
      finalUser = {
        ...user,
        id: user?.id || decoded.id,
        email: user?.email || decoded.email,
        fullName: user?.fullName || decoded.fullName || 'Người Dùng',
        role: user?.role || decoded[CLAIM.ROLE],
      } as UserProfile;
    } catch (e) {
      console.warn('Lỗi decode token:', e);
    }

    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(finalUser));
    set({ token, user: finalUser, isAuthenticated: true });
  },

  // Đăng xuất — xóa hết (auth + subscription + stores)
  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'user']);
    useSubscriptionStore.getState().clear();
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Hydrate — load từ AsyncStorage khi mở app
  hydrate: async () => {
    try {
      const [token, savedUser] = await AsyncStorage.multiGet(['accessToken', 'user']);
      const tokenValue = token[1];
      const userValue = savedUser[1];

      if (tokenValue) {
        set({
          token: tokenValue,
          user: userValue ? JSON.parse(userValue) : null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
