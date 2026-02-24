import { apiClient } from './client';
import type {
  ApiResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
} from '@/src/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/register', data),

  getProfile: () => apiClient.get<ApiResponse<{ user: UserProfile }>>('/identity/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/change-password', data),
};
