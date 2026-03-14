import { apiClient } from './client';
import type {
  ApiResponse,
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
import { extractList, extractSingle } from './utils/normalizeResponse';

type EmployeeRole = 'Manager' | 'Staff';

function buildUploadFormData(file: File | any, fieldName = 'file'): FormData {
  if (typeof FormData !== 'undefined' && file instanceof FormData) {
    return file;
  }

  const formData = new FormData();
  formData.append(fieldName, file as any);
  return formData;
}

// =============================================
// HR API — Nhân sự, Công việc, Chấm công
// Base: /hr/...
// =============================================

export const hrApi = {
  // ──────────── EMPLOYEES (Nhân viên) ────────────

  /** Danh sách nhân viên trong store hiện tại */
  async getEmployees(storeId?: string, params?: { paging?: number }): Promise<Employee[]> {
    try {
      const res = await apiClient.get<ApiResponse<Employee[]> | Employee[]>('/hr/employees', {
        params: {
          ...(storeId ? { storeId } : {}),
          ...(params ?? {}),
        },
      });
      return extractList<Employee>(res);
    } catch (error) {
      console.error('[hrApi.getEmployees] Failed to fetch employees:', error);
      throw error;
    }
  },

  /** Chi tiết 1 nhân viên theo ID */
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const res = await apiClient.get<ApiResponse<Employee> | Employee>(`/hr/employees/${id}`);
      return extractSingle<Employee>(res);
    } catch (error) {
      console.error(`[hrApi.getEmployeeById] Failed for id=${id}:`, error);
      throw error;
    }
  },

  /** Alias tương thích ngược */
  getEmployee: (id: string) => hrApi.getEmployeeById(id),

  /** Thông tin nhân viên hiện tại (bản thân) */
  async getMe(): Promise<Employee> {
    try {
      const res = await apiClient.get<ApiResponse<Employee> | Employee>('/hr/employees/me');
      return extractSingle<Employee>(res);
    } catch (error) {
      console.error('[hrApi.getMe] Failed to fetch current employee profile:', error);
      throw error;
    }
  },

  /** Cập nhật profile của bản thân */
  async updateMe(data: UpdateEmployeeProfileDto): Promise<Employee> {
    try {
      const res = await apiClient.put<ApiResponse<Employee> | Employee>('/hr/employees/me', data);
      return extractSingle<Employee>(res);
    } catch (error) {
      console.error('[hrApi.updateMe] Failed to update current employee profile:', error);
      throw error;
    }
  },

  /** Upload avatar (FormData với field "file") */
  async uploadAvatar(file: File | FormData): Promise<{ avatarUrl: string }> {
    try {
      const formData = buildUploadFormData(file);
      const res = await apiClient.post<ApiResponse<{ avatarUrl: string }> | { avatarUrl: string }>(
        '/hr/employees/me/avatar',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return extractSingle<{ avatarUrl: string }>(res);
    } catch (error) {
      console.error('[hrApi.uploadAvatar] Failed to upload avatar:', error);
      throw error;
    }
  },

  /** Mời nhân viên qua email */
  async inviteEmployee(
    email: string,
    role: EmployeeRole,
    storeId: string,
  ): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<ApiResponse<{ message: string }> | { message: string }>(
        '/identity/staff/invite',
        { email, role, storeId },
      );
      return extractSingle<{ message: string }>(res);
    } catch (error) {
      console.error('[hrApi.inviteEmployee] Failed to invite employee:', error);
      throw error;
    }
  },

  /** Tạm dịch: Mời nhân viên qua email (Identity Server) */
  inviteStaff: (data: { email: string; storeId: string; role?: string }) =>
    hrApi.inviteEmployee(data.email, (data.role as EmployeeRole) ?? 'Staff', data.storeId),

  /** Owner/Manager cập nhật thông tin nhân viên */
  async updateEmployee(id: string, data: UpdateEmployeeByOwnerDto): Promise<Employee> {
    try {
      const res = await apiClient.put<ApiResponse<Employee> | Employee>(`/hr/employees/${id}`, data);
      return extractSingle<Employee>(res);
    } catch (error) {
      console.error(`[hrApi.updateEmployee] Failed for id=${id}:`, error);
      throw error;
    }
  },

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
  async uploadSelfie(file: File | FormData): Promise<{ avatarUrl: string }> {
    try {
      const formData = buildUploadFormData(file);
      const res = await apiClient.post<ApiResponse<{ avatarUrl: string }> | { avatarUrl: string }>(
        '/hr/timekeeping/upload-selfie',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return extractSingle<{ avatarUrl: string }>(res);
    } catch (error) {
      console.error('[hrApi.uploadSelfie] Failed to upload selfie:', error);
      throw error;
    }
  },

  /** Tổng kết chấm công tháng (Owner/Manager only) */
  getMonthlySummary: () => apiClient.get<ApiResponse<any>>('/hr/timekeeping/summary'),
};
