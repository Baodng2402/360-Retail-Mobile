// ===== API =====
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

// ===== Auth =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ===== User =====
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

// ===== Business =====
export interface Store {
  id: string;
  storeName: string;
  address?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  categoryName?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
}
