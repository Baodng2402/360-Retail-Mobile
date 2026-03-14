import { apiClient } from './client';
import type { ApiResponse } from '@/src/types';

// Store API — quản lý cửa hàng + switch store context
export const storeApi = {
  // Store hiện tại (từ JWT store_id claim) — trả về 1 object
  // Response: { id, storeName, address, phone, isActive, createdAt, yourRole }
  getCurrentStore: () => apiClient.get<ApiResponse<any>>('/saas/stores/my-store'),

  // DS stores mà user sở hữu (Owner) — trả về array với full details
  // Response: [{ id, storeName, address, phone, isActive, createdAt, isDefault }]
  getMyOwnedStores: () =>
    apiClient.get<ApiResponse<any>>('/saas/stores/my-owned-stores?includeInactive=true'),

  // DS tất cả stores user thuộc về (gồm Staff) — trả về array lightweight
  // Response: [{ storeId, roleInStore, isDefault }]
  getMyStoreAccess: () => apiClient.get<ApiResponse<any>>('/identity/stores-my'),

  // Chi tiết 1 store
  getDetail: (storeId: string) => apiClient.get<ApiResponse<any>>(`/saas/stores/${storeId}`),

  // Switch store context → trả về token mới chứa store_id
  switchStore: (storeId: string) =>
    apiClient.post<ApiResponse<any>>(`/identity/auth/refresh-access?storeId=${storeId}`),
};
