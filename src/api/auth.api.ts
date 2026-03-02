import { apiClient } from './client';
import {
  type ApiResponse,
  type ChangePasswordRequest,
  type LoginRequest,
  type LoginExternalRequest,
  type LoginResponse,
  type RegisterRequest,
  type UserProfile,
} from '@/src/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/login', data),

  loginExternal: (data: LoginExternalRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/external', data),
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/register', data),

  getProfile: () => apiClient.get<ApiResponse<{ user: UserProfile }>>('/identity/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/identity/auth/change-password', data),
  verifyEmail: (email: string, otpCode: string) =>
    apiClient.post<ApiResponse<any>>('/identity/auth/verify-email', { email, otpCode }),

  resendOTP: (email: string) =>
    apiClient.post<ApiResponse<any>>('/identity/auth/resend-otp', { email }),
};
