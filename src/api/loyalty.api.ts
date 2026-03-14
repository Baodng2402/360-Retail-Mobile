import { apiClient } from './client';
import { extractList, extractSingle } from './utils/normalizeResponse';
import type {
  ApiResponse,
  CreateLoyaltyRuleDto,
  LoyaltyRule,
  LoyaltySummary,
  LoyaltyTransaction,
} from '@/src/types';

export const loyaltyApi = {
  async getLoyaltyRules(): Promise<LoyaltyRule[]> {
    try {
      const res = await apiClient.get<ApiResponse<LoyaltyRule[]> | LoyaltyRule[]>('/crm/loyalty-rules');
      return extractList<LoyaltyRule>(res);
    } catch (error) {
      console.error('[loyaltyApi.getLoyaltyRules] Failed to fetch loyalty rules:', error);
      throw error;
    }
  },

  async createLoyaltyRule(data: CreateLoyaltyRuleDto): Promise<LoyaltyRule> {
    try {
      const res = await apiClient.post<ApiResponse<LoyaltyRule> | LoyaltyRule>('/crm/loyalty-rules', data);
      return extractSingle<LoyaltyRule>(res);
    } catch (error) {
      console.error('[loyaltyApi.createLoyaltyRule] Failed to create loyalty rule:', error);
      throw error;
    }
  },

  async updateLoyaltyRule(id: string, data: CreateLoyaltyRuleDto): Promise<LoyaltyRule> {
    try {
      const res = await apiClient.put<ApiResponse<LoyaltyRule> | LoyaltyRule>(
        `/crm/loyalty-rules/${id}`,
        data,
      );
      return extractSingle<LoyaltyRule>(res);
    } catch (error) {
      console.error(`[loyaltyApi.updateLoyaltyRule] Failed for id=${id}:`, error);
      throw error;
    }
  },

  async deleteLoyaltyRule(id: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/loyalty-rules/${id}`);
    } catch (error) {
      console.error(`[loyaltyApi.deleteLoyaltyRule] Failed for id=${id}:`, error);
      throw error;
    }
  },

  async getCustomerLoyaltySummary(customerId: string): Promise<LoyaltySummary> {
    try {
      const res = await apiClient.get<ApiResponse<LoyaltySummary> | LoyaltySummary>(
        `/crm/customers/${customerId}/loyalty-summary`,
      );
      return extractSingle<LoyaltySummary>(res);
    } catch (error) {
      console.error(
        `[loyaltyApi.getCustomerLoyaltySummary] Failed for customerId=${customerId}:`,
        error,
      );
      throw error;
    }
  },

  async getCustomerLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    try {
      const res = await apiClient.get<ApiResponse<LoyaltyTransaction[]> | LoyaltyTransaction[]>(
        `/crm/customers/${customerId}/loyalty-transactions`,
      );
      return extractList<LoyaltyTransaction>(res);
    } catch (error) {
      console.error(
        `[loyaltyApi.getCustomerLoyaltyTransactions] Failed for customerId=${customerId}:`,
        error,
      );
      throw error;
    }
  },

  async redeemPoints(customerId: string, points: number): Promise<void> {
    try {
      await apiClient.post(`/crm/customers/${customerId}/redeem`, { points });
    } catch (error) {
      console.error(`[loyaltyApi.redeemPoints] Failed for customerId=${customerId}:`, error);
      throw error;
    }
  },
};
