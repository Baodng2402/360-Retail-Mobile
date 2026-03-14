import { apiClient } from './client';
import { extractList, extractPaged, extractSingle } from './utils/normalizeResponse';
import type { ApiResponse, Feedback, FeedbackSummary } from '@/src/types';

export const feedbackApi = {
  async getFeedback(params?: {
    fromDate?: string;
    toDate?: string;
    paging?: number;
    pageSize?: number;
  }): Promise<Feedback[]> {
    try {
      const res = await apiClient.get<ApiResponse<unknown> | unknown>('/crm/feedback', {
        params,
      });

      const paged = extractPaged<Feedback>(res);
      if (paged.items.length > 0) {
        return paged.items;
      }

      return extractList<Feedback>(res);
    } catch (error) {
      console.error('[feedbackApi.getFeedback] Failed to fetch feedback list:', error);
      throw error;
    }
  },

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    try {
      const res = await apiClient.get<ApiResponse<FeedbackSummary> | FeedbackSummary>(
        '/crm/feedback/summary',
      );
      return extractSingle<FeedbackSummary>(res);
    } catch (error) {
      console.error('[feedbackApi.getFeedbackSummary] Failed to fetch feedback summary:', error);
      throw error;
    }
  },
};
