import { apiClient } from './client';
import type {
  ApiResponse,
  InventoryTicket,
  CreateInventoryTicketDto,
  GetInventoryParams,
} from '@/src/types';

export const inventoryApi = {
  async createTicket(data: CreateInventoryTicketDto): Promise<string> {
    const res = await apiClient.post<ApiResponse<string> | string>('sales/inventory', data);

    if (typeof res.data === 'object' && res.data !== null && 'success' in res.data) {
      const apiRes = res.data as ApiResponse<string>;
      if (apiRes.success && typeof apiRes.data === 'string') {
        return apiRes.data;
      }
    }
    if (typeof res.data === 'string') {
      return res.data;
    }
    throw new Error('Invalid response format');
  },

  async getTickets(params?: GetInventoryParams): Promise<{
    items: InventoryTicket[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    query.append('page', (params?.page ?? 1).toString());
    query.append('pageSize', (params?.pageSize ?? 20).toString());

    const res = await apiClient.get<
      | ApiResponse<{
          items: InventoryTicket[];
          totalCount: number;
          pageNumber: number;
          pageSize: number;
          totalPages: number;
        }>
      | InventoryTicket[]
    >(`sales/inventory?${query.toString()}`);

    if (res.data && 'success' in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount ?? data.items.length,
          pageNumber: data.pageNumber ?? 1,
          pageSize: data.pageSize ?? 20,
          totalPages: data.totalPages ?? 1,
        };
      }
      if (Array.isArray(data)) {
        return {
          items: data as InventoryTicket[],
          totalCount: data.length,
          pageNumber: 1,
          pageSize: data.length,
          totalPages: 1,
        };
      }
    }
    if (Array.isArray(res.data)) {
      return {
        items: res.data,
        totalCount: res.data.length,
        pageNumber: 1,
        pageSize: res.data.length,
        totalPages: 1,
      };
    }

    // Fallback for nested data arrays without success payload
    const rawData = res.data?.data as any;
    if (typeof rawData === 'object' && 'items' in rawData && Array.isArray(rawData.items)) {
      return {
        items: rawData.items,
        totalCount: rawData.totalCount ?? rawData.items.length,
        pageNumber: rawData.pageNumber ?? 1,
        pageSize: rawData.pageSize ?? 20,
        totalPages: rawData.totalPages ?? 1,
      };
    }

    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 };
  },

  async getTicketById(id: string): Promise<InventoryTicket> {
    const res = await apiClient.get<ApiResponse<InventoryTicket> | InventoryTicket>(
      `sales/inventory/${id}`
    );

    if (res.data && 'success' in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as InventoryTicket;
  },

  async confirmTicket(id: string): Promise<void> {
    await apiClient.put(`sales/inventory/${id}/confirm`);
  },

  async cancelTicket(id: string): Promise<void> {
    await apiClient.put(`sales/inventory/${id}/cancel`);
  },

  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`sales/inventory/${id}`);
  },

  async checkLowStock(threshold = 10): Promise<void> {
    await apiClient.post(`sales/notifications/low-stock-check?threshold=${threshold}`);
  },
};
