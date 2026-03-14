import { apiClient } from './client';
import { extractList, extractPaged, extractSingle } from './utils/normalizeResponse';
import type {
  ApiResponse,
  TimekeepingHistoryRecord,
  TodayTimekeepingResponse,
} from '@/src/types';

function toGps(lat: number, lon: number): string {
  return `${lat},${lon}`;
}

function toUploadFormData(file: File | FormData): FormData {
  if (typeof FormData !== 'undefined' && file instanceof FormData) {
    return file;
  }
  const formData = new FormData();
  formData.append('file', file as any);
  return formData;
}

export interface CheckInResult {
  message: string;
  checkInTime?: string;
}

export interface CheckOutResult {
  message: string;
  checkOutTime?: string;
  workHours?: number;
}

export const timekeepingApi = {
  async checkIn(latitude: number, longitude: number, selfieUrl?: string): Promise<CheckInResult> {
    try {
      const res = await apiClient.post<ApiResponse<CheckInResult> | CheckInResult>(
        '/hr/timekeeping/check-in',
        {
          locationGps: toGps(latitude, longitude),
          checkInImageUrl: selfieUrl,
        },
      );
      return extractSingle<CheckInResult>(res);
    } catch (error) {
      console.error('[timekeepingApi.checkIn] Failed to check in:', error);
      throw error;
    }
  },

  async checkOut(latitude: number, longitude: number): Promise<CheckOutResult> {
    try {
      const res = await apiClient.post<ApiResponse<CheckOutResult> | CheckOutResult>(
        '/hr/timekeeping/check-out',
        {
          locationGps: toGps(latitude, longitude),
        },
      );
      return extractSingle<CheckOutResult>(res);
    } catch (error) {
      console.error('[timekeepingApi.checkOut] Failed to check out:', error);
      throw error;
    }
  },

  async getTodayStatus(): Promise<TodayTimekeepingResponse> {
    try {
      const res = await apiClient.get<ApiResponse<TodayTimekeepingResponse> | TodayTimekeepingResponse>(
        '/hr/timekeeping/today',
      );
      return extractSingle<TodayTimekeepingResponse>(res);
    } catch (error) {
      console.error('[timekeepingApi.getTodayStatus] Failed to fetch today status:', error);
      throw error;
    }
  },

  async getTimekeepingHistory(params?: { paging?: number }): Promise<TimekeepingHistoryRecord[]> {
    try {
      const res = await apiClient.get<ApiResponse<unknown> | unknown>('/hr/timekeeping', {
        params,
      });

      const paged = extractPaged<TimekeepingHistoryRecord>(res);
      if (paged.items.length > 0) {
        return paged.items;
      }

      return extractList<TimekeepingHistoryRecord>(res);
    } catch (error) {
      console.error('[timekeepingApi.getTimekeepingHistory] Failed to fetch history:', error);
      throw error;
    }
  },

  async uploadSelfie(file: File | FormData): Promise<{ url: string }> {
    try {
      const formData = toUploadFormData(file);
      const res = await apiClient.post<ApiResponse<{ url?: string; imageUrl?: string }> | { url?: string; imageUrl?: string }>(
        '/hr/timekeeping/upload-selfie',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const data = extractSingle<{ url?: string; imageUrl?: string }>(res);
      return { url: data.url ?? data.imageUrl ?? '' };
    } catch (error) {
      console.error('[timekeepingApi.uploadSelfie] Failed to upload selfie:', error);
      throw error;
    }
  },
};
