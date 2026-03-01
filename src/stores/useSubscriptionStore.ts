import { create } from 'zustand';
import { subscriptionApi } from '@/src/api/subscription.api';
import { getPlanConfig } from '@/src/config/plan.config';
import type { FeatureKey } from '@/src/config/plan.config';
import type { SubscriptionStatus } from '@/src/types';

// =============================================
// Subscription Store — Zustand
// Quản lý trạng thái gói đăng ký + feature gating
// Usage: const { canUse, getLimit } = useSubscriptionStore()
// =============================================

interface SubscriptionState {
  status: SubscriptionStatus | null;
  isLoading: boolean;

  // Actions
  fetchStatus: () => Promise<void>;
  clear: () => void;

  // Selectors — kiểm tra quyền truy cập tính năng
  canUse: (feature: FeatureKey) => boolean;
  getLimit: (key: 'maxProducts' | 'maxStaff' | 'maxOrdersPerMonth') => number;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  status: null,
  isLoading: false,

  // Gọi API lấy trạng thái subscription hiện tại
  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const res = await subscriptionApi.getStatus();
      const data = res.data as unknown as SubscriptionStatus;
      set({ status: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Xóa state khi logout
  clear: () => set({ status: null, isLoading: false }),

  // Kiểm tra tính năng có được phép dùng không (check feature flag theo plan)
  canUse: (feature: FeatureKey) => {
    const { status } = get();
    const config = getPlanConfig(status?.planName ?? null);
    return config.features[feature];
  },

  // Lấy giới hạn số lượng theo plan hiện tại
  getLimit: (key) => {
    const { status } = get();
    const config = getPlanConfig(status?.planName ?? null);
    return config.limits[key];
  },
}));
