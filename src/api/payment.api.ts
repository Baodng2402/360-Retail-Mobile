import { apiClient } from './client';
import { extractSingle } from './utils/normalizeResponse';
import type { ApiResponse } from '@/src/types';

type PaymentProvider = 'vnpay' | 'sepay';

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return fallback();
    }
    throw error;
  }
}

export const paymentApi = {
  async purchasePlan(planId: string): Promise<{ paymentId: string; message: string }> {
    try {
      return await withFallback(
        async () => {
          const res = await apiClient.post<
            ApiResponse<{ paymentId: string; message: string }> | { paymentId: string; message: string }
          >('/saas/subscriptions/purchase', { planId });
          return extractSingle<{ paymentId: string; message: string }>(res);
        },
        async () => {
          const res = await apiClient.post<
            ApiResponse<{ paymentId: string; message: string }> | { paymentId: string; message: string }
          >('/subscriptions/purchase', { planId });
          return extractSingle<{ paymentId: string; message: string }>(res);
        },
      );
    } catch (error) {
      console.error('[paymentApi.purchasePlan] Failed to purchase plan:', error);
      throw error;
    }
  },

  async initiatePayment(
    paymentId: string,
    provider: PaymentProvider,
  ): Promise<{ paymentUrl?: string; qrCode?: string }> {
    try {
      return await withFallback(
        async () => {
          const res = await apiClient.get<
            ApiResponse<{ paymentUrl?: string; qrCode?: string }> | { paymentUrl?: string; qrCode?: string }
          >('/saas/payments/initiate', {
            params: { paymentId, provider },
          });
          return extractSingle<{ paymentUrl?: string; qrCode?: string }>(res);
        },
        async () => {
          const res = await apiClient.get<
            ApiResponse<{ paymentUrl?: string; qrCode?: string }> | { paymentUrl?: string; qrCode?: string }
          >('/payments/initiate', {
            params: { paymentId, provider },
          });
          return extractSingle<{ paymentUrl?: string; qrCode?: string }>(res);
        },
      );
    } catch (error) {
      console.error('[paymentApi.initiatePayment] Failed to initiate payment:', error);
      throw error;
    }
  },

  async checkPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'success' | 'failed' }> {
    try {
      return await withFallback(
        async () => {
          const res = await apiClient.get<
            ApiResponse<{ status: 'pending' | 'success' | 'failed' }> | { status: 'pending' | 'success' | 'failed' }
          >(`/saas/payments/${paymentId}/status`);
          return extractSingle<{ status: 'pending' | 'success' | 'failed' }>(res);
        },
        async () => {
          const res = await apiClient.get<
            ApiResponse<{ status: 'pending' | 'success' | 'failed' }> | { status: 'pending' | 'success' | 'failed' }
          >(`/payments/${paymentId}/status`);
          return extractSingle<{ status: 'pending' | 'success' | 'failed' }>(res);
        },
      );
    } catch (error) {
      console.error(`[paymentApi.checkPaymentStatus] Failed for paymentId=${paymentId}:`, error);
      throw error;
    }
  },
};
