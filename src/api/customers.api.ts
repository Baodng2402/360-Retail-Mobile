import { apiClient } from './client';
import { extractPaged, extractSingle } from './utils/normalizeResponse';
import type { ApiResponse, Customer } from '@/src/types';

/**
 * Customers API layer for CRUD operations.
 */
export const customersApi = {
  /**
   * Fetch customers list with optional pagination params.
   */
  async getCustomers(params?: { paging?: number; pageSize?: number }): Promise<Customer[]> {
    try {
      const res = await apiClient.get<ApiResponse<unknown> | unknown>('/crm/customers', {
        params,
      });

      return extractPaged<Customer>(res).items;
    } catch (error) {
      console.error('[customersApi.getCustomers] Failed to fetch customers:', error);
      throw error;
    }
  },

  /**
   * Fetch customer detail by id.
   */
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const res = await apiClient.get<ApiResponse<Customer> | Customer>(`/crm/customers/${id}`);
      return extractSingle<Customer>(res);
    } catch (error) {
      console.error(`[customersApi.getCustomerById] Failed for id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new customer. Mirrors BE CreateCustomerDto.
   */
  async createCustomer(fullName: string, phoneNumber: string, zaloId?: string): Promise<Customer> {
    try {
      const res = await apiClient.post<ApiResponse<Customer> | Customer>('/crm/customers', {
        fullName,
        phoneNumber,
        zaloId,
      });
      return extractSingle<Customer>(res);
    } catch (error) {
      console.error('[customersApi.createCustomer] Failed to create customer:', error);
      throw error;
    }
  },

  /**
   * Update an existing customer. Mirrors BE UpdateCustomerDto.
   */
  async updateCustomer(
    id: string,
    data: { fullName?: string; phoneNumber?: string; zaloId?: string },
  ): Promise<Customer> {
    try {
      const res = await apiClient.put<ApiResponse<Customer> | Customer>(`/crm/customers/${id}`, data);
      return extractSingle<Customer>(res);
    } catch (error) {
      console.error(`[customersApi.updateCustomer] Failed for id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete customer by id.
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/customers/${id}`);
    } catch (error) {
      console.error(`[customersApi.deleteCustomer] Failed for id=${id}:`, error);
      throw error;
    }
  },
};
