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
  role?: string;
}

// ===== Business =====
export interface Store {
  id: string;
  storeName: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  productName: string;
  price: number;
  stockQuantity: number;
  categoryName?: string;
  sku?: string;
  image?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Order {
  id: string;
  code: string;
  customerName?: string;
  customerAvatar?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

// ===== POS / Sales =====
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// ===== Activity =====
export interface ActivityItem {
  id: string;
  type: 'order_shipped' | 'payment_received' | 'new_order' | 'stock_alert';
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  iconColor: string;
}

// ===== Reports =====
export interface BestSeller {
  id: string;
  name: string;
  category: string;
  salesCount: number;
  revenue: number;
  trend: number;
  image?: string;
}

// ===== OTP =====
export interface VerifyEmail {
  email: string;
  otpCode: string;
}
export interface ReSendOTP {
  message: string;
  email: string;
}

// ===== Subscription =====
export interface SubscriptionStatus {
  status: string;
  hasStore: boolean;
  storeId: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number | null;
  planName: string | null;
}
