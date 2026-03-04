import { create } from 'zustand';
import type { FeatureGateErrorType, FeatureGatePayload } from '@/src/types';

// =============================================
// Feature Gate Store — Zustand
// Quản lý trạng thái dialog "Nâng cấp gói" toàn cục
// Được kích hoạt tự động khi HTTP 403 trả về lỗi subscription
//
// Usage:
//   const { isOpen, openUpgradeModal } = useFeatureGateStore()
// =============================================

interface FeatureGateState extends FeatureGatePayload {
  isOpen: boolean;

  /** Mở dialog nâng cấp — gọi từ axios 403 interceptor */
  openUpgradeModal: (payload: FeatureGatePayload) => void;

  /** Đóng dialog — gọi khi user nhấn "Để sau" */
  closeUpgradeModal: () => void;
}

export const useFeatureGateStore = create<FeatureGateState>((set) => ({
  // === State mặc định ===
  isOpen: false,
  errorType: 'FeatureNotAvailable',
  message: undefined,
  currentPlan: undefined,
  requiredPlan: undefined,
  feature: undefined,

  // === Actions ===
  openUpgradeModal: (payload) =>
    set({
      isOpen: true,
      ...payload,
    }),

  closeUpgradeModal: () =>
    set({
      isOpen: false,
      message: undefined,
      currentPlan: undefined,
      requiredPlan: undefined,
      feature: undefined,
    }),
}));
