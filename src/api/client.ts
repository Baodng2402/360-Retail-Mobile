import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeatureGateStore } from '@/src/stores/useFeatureGateStore';
import type { FeatureGateErrorType } from '@/src/types';

// =============================================
// Axios Client — Cấu hình HTTP client dùng chung
//
// Tính năng:
//   1. Tự động gắn Bearer token vào mỗi request
//   2. Xử lý 401 → xóa token (session hết hạn)
//   3. Xử lý 403 → phân biệt Feature Gate errors
//      (TrialExpired / SubscriptionExpired / FeatureNotAvailable)
// =============================================

const extra = Constants.expoConfig?.extra as { EXPO_PUBLIC_API_URL?: string } | undefined;
const API_URL = extra?.EXPO_PUBLIC_API_URL;

/** Danh sách error codes từ backend cho Feature Gating */
const FEATURE_GATE_ERRORS: FeatureGateErrorType[] = [
  'TrialExpired',
  'SubscriptionExpired',
  'FeatureNotAvailable',
];

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ──────────── REQUEST INTERCEPTOR ────────────
// Tự động gắn token vào header Authorization
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────── RESPONSE INTERCEPTOR ────────────
// Xử lý lỗi 401 (hết phiên) và 403 (feature gate)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // 401 — Token hết hạn hoặc không hợp lệ → xóa token
    if (status === 401) {
      await AsyncStorage.removeItem('accessToken');
      // TODO: navigate to Login screen
    }

    // 403 — Kiểm tra có phải Feature Gate error không
    if (status === 403 && data) {
      const errorCode = data.error as FeatureGateErrorType;

      if (FEATURE_GATE_ERRORS.includes(errorCode)) {
        // Mở dialog nâng cấp gói tự động
        useFeatureGateStore.getState().openUpgradeModal({
          errorType: errorCode,
          message: data.message,
          currentPlan: data.currentPlan, // chỉ có khi FeatureNotAvailable
          requiredPlan: data.requiredPlan, // chỉ có khi FeatureNotAvailable
          feature: data.feature, // chỉ có khi FeatureNotAvailable
        });
      }
    }

    return Promise.reject(error);
  }
);
