import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Employee,
  UpdateEmployeeProfileDto,
  UpdateEmployeeByOwnerDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  TodayTimekeepingResponse,
  TimekeepingHistoryRecord,
  CheckInDto,
} from '@/src/types';

// =============================================
// HR API — Nhân sự, Công việc, Chấm công
// Base: /hr/...
// =============================================

export const hrApi = {
  // ──────────── EMPLOYEES (Nhân viên) ────────────

  /** Danh sách nhân viên trong store hiện tại */
  getEmployees: () => apiClient.get<ApiResponse<Employee[]>>('/hr/employees'),

  /** Chi tiết 1 nhân viên theo ID */
  getEmployee: (id: string) => apiClient.get<ApiResponse<Employee>>(`/hr/employees/${id}`),

  /** Thông tin nhân viên hiện tại (bản thân) */
  getMe: () => apiClient.get<ApiResponse<Employee>>('/hr/employees/me'),

  /** Cập nhật profile của bản thân */
  updateMe: (data: UpdateEmployeeProfileDto) =>
    apiClient.put<ApiResponse<Employee>>('/hr/employees/me', data),

  /** Upload avatar (FormData với field "file") */
  uploadAvatar: (formData: FormData) =>
    apiClient.post<ApiResponse<{ avatarUrl: string }>>('/hr/employees/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Owner/Manager cập nhật thông tin nhân viên */
  updateEmployee: (id: string, data: UpdateEmployeeByOwnerDto) =>
    apiClient.put<ApiResponse<Employee>>(`/hr/employees/${id}`, data),

  // ──────────── TASKS (Công việc) ────────────

  /** Danh sách tasks trong store (Owner/Manager) */
  getTasks: () => apiClient.get<ApiResponse<Task[]>>('/hr/tasks'),

  /** Danh sách tasks của bản thân */
  getMyTasks: () => apiClient.get<ApiResponse<Task[]>>('/hr/tasks/me'),

  /** Chi tiết 1 task */
  getTask: (id: string) => apiClient.get<ApiResponse<Task>>(`/hr/tasks/${id}`),

  /** Tạo task mới (Owner/Manager) */
  createTask: (data: CreateTaskDto) => apiClient.post<ApiResponse<Task>>('/hr/tasks', data),

  /** Sửa task (Owner/Manager) */
  updateTask: (id: string, data: UpdateTaskDto) =>
    apiClient.put<ApiResponse<Task>>(`/hr/tasks/${id}`, data),

  /** Cập nhật trạng thái task */
  updateTaskStatus: (id: string, status: TaskStatus) =>
    apiClient.put<ApiResponse<Task>>(`/hr/tasks/${id}/status?status=${status}`),

  /** Xóa task (Owner/Manager) */
  deleteTask: (id: string) => apiClient.delete<ApiResponse<null>>(`/hr/tasks/${id}`),

  // ──────────── TIMEKEEPING (Chấm công) ────────────

  /** Trạng thái chấm công hôm nay */
  getToday: () => apiClient.get<ApiResponse<TodayTimekeepingResponse>>('/hr/timekeeping/today'),

  /** Lịch sử chấm công */
  getHistory: () => apiClient.get<ApiResponse<TimekeepingHistoryRecord[]>>('/hr/timekeeping'),

  /** Check-in (GPS + ảnh selfie) */
  checkIn: (data: CheckInDto) => apiClient.post<ApiResponse<any>>('/hr/timekeeping/check-in', data),

  /** Check-out (GPS) */
  checkOut: (data: { locationGps: string }) =>
    apiClient.post<ApiResponse<any>>('/hr/timekeeping/check-out', data),

  /** Upload selfie chấm công (FormData với field "file") */
  uploadSelfie: (formData: FormData) =>
    apiClient.post<ApiResponse<{ imageUrl: string }>>('/hr/timekeeping/upload-selfie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Tổng kết chấm công tháng (Owner/Manager only) */
  getMonthlySummary: () => apiClient.get<ApiResponse<any>>('/hr/timekeeping/summary'),
};
