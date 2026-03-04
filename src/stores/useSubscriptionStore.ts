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
      // API trả về { data: { data: SubscriptionStatus } } hoặc { data: SubscriptionStatus }
      const raw = res.data as any;
      const data: SubscriptionStatus = raw?.data ?? raw;
      console.log('[SubscriptionStore] planName:', data?.planName, 'status:', data?.status);
      set({ status: data, isLoading: false });
    } catch (err) {
      console.error('[SubscriptionStore] fetchStatus error:', err);
      set({ isLoading: false });
    }
  },

  // Xóa state khi logout
  clear: () => set({ status: null, isLoading: false }),

  // Kiểm tra tính năng có được phép dùng không (check feature flag theo plan)
  canUse: (feature: FeatureKey) => {
    const { status } = get();

    // Nếu subscription đang Active mà planName null → BE không trả plan name
    // → mặc định mở khoá tất cả (user đã trả tiền)
    if (status?.status === 'Active' && !status.planName) {
      return true;
    }

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
