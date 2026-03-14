import { apiClient } from './client';
import { extractList, extractSingle } from './utils/normalizeResponse';
import type { ApiResponse, CreateTaskDto, Task, TaskStatus } from '@/src/types';

export const tasksApi = {
  async createTask(data: CreateTaskDto): Promise<Task> {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        deadline: data.dueDate,
        priority: data.priority,
      };

      const res = await apiClient.post<ApiResponse<Task> | Task>('/hr/tasks', payload);
      return extractSingle<Task>(res);
    } catch (error) {
      console.error('[tasksApi.createTask] Failed to create task:', error);
      throw error;
    }
  },

  async updateTask(id: string, data: CreateTaskDto): Promise<Task> {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        deadline: data.dueDate,
        priority: data.priority,
      };

      const res = await apiClient.put<ApiResponse<Task> | Task>(`/hr/tasks/${id}`, payload);
      return extractSingle<Task>(res);
    } catch (error: any) {
      console.error(`[tasksApi.updateTask] Failed for id=${id}:`, error.response?.data || error);
      throw error;
    }
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    try {
      await apiClient.put(`/hr/tasks/${id}/status?status=${status}`);
    } catch (error: any) {
      console.error(`[tasksApi.updateTaskStatus] Failed for id=${id}:`, error.response?.data || error);
      throw error;
    }
  },

  async getTasks(storeId: string): Promise<Task[]> {
    try {
      const res = await apiClient.get<ApiResponse<Task[]> | Task[]>('/hr/tasks', {
        params: { storeId },
      });
      return extractList<Task>(res);
    } catch (error) {
      console.error('[tasksApi.getTasks] Failed to fetch tasks:', error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`/hr/tasks/${id}`);
    } catch (error) {
      console.error(`[tasksApi.deleteTask] Failed for id=${id}:`, error);
      throw error;
    }
  },

  async getMyTasks(): Promise<Task[]> {
    try {
      const res = await apiClient.get<ApiResponse<Task[]> | Task[]>('/hr/tasks/me');
      return extractList<Task>(res);
    } catch (error) {
      console.error('[tasksApi.getMyTasks] Failed to fetch my tasks:', error);
      throw error;
    }
  },
};
