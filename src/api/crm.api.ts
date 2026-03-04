import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  Feedback,
  FeedbackSummary,
  CreateFeedbackDto,
  LoyaltyRule,
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
  LoyaltySummary,
  LoyaltyTransaction,
  RedeemPointsDto,
} from '@/src/types';

// =============================================
// CRM API — Khách hàng, Phản hồi, Loyalty
// Base: /crm/...
// =============================================

export const crmApi = {
  // ──────────── CUSTOMERS (Khách hàng) ────────────

  /** Danh sách khách hàng (có phân trang) */
  getCustomers: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Customer>>>('/crm/customers', { params }),

  /** Chi tiết 1 khách hàng */
  getCustomer: (id: string) => apiClient.get<ApiResponse<Customer>>(`/crm/customers/${id}`),

  /** Tạo khách hàng mới */
  createCustomer: (data: CreateCustomerDto) =>
    apiClient.post<ApiResponse<Customer>>('/crm/customers', data),

  /** Sửa khách hàng */
  updateCustomer: (id: string, data: UpdateCustomerDto) =>
    apiClient.put<ApiResponse<Customer>>(`/crm/customers/${id}`, data),

  /** Xóa khách hàng (Owner/Manager only) */
  deleteCustomer: (id: string) => apiClient.delete<ApiResponse<null>>(`/crm/customers/${id}`),

  /** Tổng hợp loyalty theo khách hàng */
  getLoyaltySummary: (customerId: string) =>
    apiClient.get<ApiResponse<LoyaltySummary>>(`/crm/customers/${customerId}/loyalty-summary`),

  /** Lịch sử giao dịch loyalty */
  getLoyaltyTransactions: (customerId: string) =>
    apiClient.get<ApiResponse<LoyaltyTransaction[]>>(
      `/crm/customers/${customerId}/loyalty-transactions`
    ),

  /** Quy đổi điểm cho khách (Owner/Manager only) */
  redeemPoints: (customerId: string, data: RedeemPointsDto) =>
    apiClient.post<ApiResponse<any>>(`/crm/customers/${customerId}/redeem`, data),

  /** Phản hồi của 1 khách hàng */
  getCustomerFeedback: (customerId: string) =>
    apiClient.get<ApiResponse<Feedback[]>>(`/crm/customers/${customerId}/feedback`),

  // ──────────── FEEDBACK (Phản hồi) ────────────

  /** Danh sách phản hồi (có phân trang) */
  getFeedbacks: (params?: { page?: number; pageSize?: number; rating?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Feedback>>>('/crm/feedback', { params }),

  /** Tổng hợp phản hồi (avg rating, distribution) */
  getFeedbackSummary: () => apiClient.get<ApiResponse<FeedbackSummary>>('/crm/feedback/summary'),

  /** Tạo phản hồi từ nhân viên (InStore) */
  createFeedback: (data: CreateFeedbackDto) =>
    apiClient.post<ApiResponse<Feedback>>('/crm/feedback', data),

  // ──────────── LOYALTY RULES (Quy tắc tích điểm) ────────────

  /** Danh sách quy tắc loyalty */
  getLoyaltyRules: () => apiClient.get<ApiResponse<LoyaltyRule[]>>('/crm/loyalty-rules'),

  /** Tạo quy tắc mới (Owner/Manager only) */
  createLoyaltyRule: (data: CreateLoyaltyRuleDto) =>
    apiClient.post<ApiResponse<LoyaltyRule>>('/crm/loyalty-rules', data),

  /** Sửa quy tắc (Owner/Manager only) */
  updateLoyaltyRule: (id: string, data: UpdateLoyaltyRuleDto) =>
    apiClient.put<ApiResponse<LoyaltyRule>>(`/crm/loyalty-rules/${id}`, data),

  /** Xóa quy tắc (Owner/Manager only) */
  deleteLoyaltyRule: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/crm/loyalty-rules/${id}`),
};
