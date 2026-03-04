import { apiClient } from './client';
import type { ApiResponse, Category } from '@/src/types';

export const categoriesApi = {
  async getCategories(storeId?: string, includeInactive?: boolean): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append('storeId', storeId);
    if (includeInactive !== undefined) {
      queryParams.append('includeInactive', includeInactive.toString());
    }

    const url = `sales/Categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const res = await apiClient.get<ApiResponse<Category[]> | Category[]>(url);

    if (res.data && 'success' in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }

    // Fallback if data is inside res.data.data but no success payload
    const rawData = res.data?.data as any;
    if (Array.isArray(rawData)) return rawData;

    return [];
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await apiClient.post<ApiResponse<Category> | Category>('sales/Categories', {
      categoryName: data.categoryName,
      parentId: data.parentId,
    });

    if (res.data && 'success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Category;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await apiClient.put<ApiResponse<Category> | Category>(`sales/Categories/${id}`, {
      id,
      categoryName: data.categoryName,
      parentId: data.parentId,
      isActive: data.isActive,
    });

    if (res.data && 'success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`sales/Categories/${id}`);
  },
};
