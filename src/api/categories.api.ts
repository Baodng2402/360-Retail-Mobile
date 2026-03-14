import { apiClient } from './client';
import type { ApiResponse, Category } from '@/src/types';
import { extractList, extractSingle } from './utils/normalizeResponse';

type CategoryInput = string | Partial<Category>;

function resolveCategoryPayload(nameOrData: CategoryInput, description?: string) {
  if (typeof nameOrData === 'string') {
    return {
      categoryName: nameOrData,
      description,
    };
  }

  return {
    categoryName: nameOrData.categoryName,
    parentId: nameOrData.parentId,
    isActive: nameOrData.isActive,
    description,
  };
}

export const categoriesApi = {
  async getCategories(storeId?: string, includeInactive?: boolean): Promise<Category[]> {
    try {
      const queryParams = new URLSearchParams();
      if (storeId) queryParams.append('storeId', storeId);
      if (includeInactive !== undefined) {
        queryParams.append('includeInactive', includeInactive.toString());
      }

      const url = `sales/Categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const res = await apiClient.get<ApiResponse<Category[]> | Category[]>(url);
      return extractList<Category>(res);
    } catch (error) {
      console.error('[categoriesApi.getCategories] Failed to fetch categories:', error);
      throw error;
    }
  },

  async createCategory(nameOrData: CategoryInput, description?: string): Promise<Category> {
    try {
      const payload = resolveCategoryPayload(nameOrData, description);
      const res = await apiClient.post<ApiResponse<Category> | Category>('sales/Categories', payload);
      return extractSingle<Category>(res);
    } catch (error) {
      console.error('[categoriesApi.createCategory] Failed to create category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, nameOrData: CategoryInput, description?: string): Promise<Category> {
    try {
      const payload = {
        id,
        ...resolveCategoryPayload(nameOrData, description),
      };

      const res = await apiClient.put<ApiResponse<Category> | Category>(`sales/Categories/${id}`, payload);
      return extractSingle<Category>(res);
    } catch (error) {
      console.error(`[categoriesApi.updateCategory] Failed for id=${id}:`, error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`sales/Categories/${id}`);
    } catch (error) {
      console.error(`[categoriesApi.deleteCategory] Failed for id=${id}:`, error);
      throw error;
    }
  },
};
