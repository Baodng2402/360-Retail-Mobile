import { apiClient } from './client';
import type { ApiResponse, SubscriptionStatus } from '@/src/types';

// Subscription API — quản lý trial (dùng thử) và gói đăng ký
export const subscriptionApi = {
  // Lấy trạng thái subscription hiện tại (current status)
  getStatus: () => apiClient.get<ApiResponse<SubscriptionStatus>>('/identity/subscription/status'),

  // Bắt đầu dùng thử 7 ngày (start free trial)
  startTrial: (storeName: string) =>
    apiClient.post<ApiResponse<any>>('/identity/subscription/start-trial', { storeName }),
};
