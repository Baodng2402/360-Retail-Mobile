import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';

import { useAppStore } from '@/src/store';

const expoExtra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_BASE_URL = expoExtra?.apiUrl ?? 'https://api.example.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAppStore.getState();

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { logout } = useAppStore.getState();
      logout();
    }

    return Promise.reject(error);
  },
);

