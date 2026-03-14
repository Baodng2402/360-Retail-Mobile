// =============================================
// 360 Retail Mobile — Type Definitions
// Đồng bộ 1:1 với Web types + Backend DTOs
// =============================================

// ===== API Response chuẩn =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[] | null;
  statusCode?: number;
}

/** Response phân trang từ backend */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

// ===== Auth =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginExternalRequest {
  provider: 'Google' | 'Facebook';
  idToken: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt?: string;
  mustChangePassword?: boolean;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

// ===== User =====
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar?: string;
  role?: string;
}

// ===== Store =====
export interface Store {
  id: string;
  storeName: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

export interface CreateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  planId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserStore {
  storeId: string;
  storeName: string;
  roleInStore: string;
  isDefault: boolean;
}

// ===== Product =====
export interface Product {
  id: string;
  productName: string;
  barCode?: string | null;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  stockQuantity: number;
  categoryId: string;
  categoryName?: string;
  /** Nested category object — một số endpoint trả về dạng này thay vì categoryName flat */
  category?: { id?: string; categoryName: string };
  imageUrl?: string | null;
  isActive: boolean;
  hasVariants?: boolean;
  isInStock?: boolean;
  totalStock?: number;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  size?: string;
  color?: string;
  variantName?: string;
  priceOverride?: number;
  stockQuantity?: number;
}

export interface GetProductsParams {
  storeId?: string;
  keyword?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
}

export interface ProductsResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateProductDto {
  productName: string;
  categoryId: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  isActive?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  imageFile?: any;
}

export interface UpdateProductDto {
  id: string;
  productName: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
  imageFile?: any;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantsJson?: string;
}

// ===== Category =====
export interface Category {
  id: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  categoryName: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  id: string;
  categoryName?: string;
  parentId?: string;
  isActive?: boolean;
}

// ===== Order =====
export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Refunded';

export interface Order {
  id: string;
  code?: string;
  storeId?: string;
  employeeId?: string;
  customerId?: string | null;
  customerName?: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  barCode?: string;
  productVariantId?: string | null;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateOrderDto {
  customerId?: string;
  paymentMethod?: string;
  discountAmount: number;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  productVariantId?: string;
}

export interface GetOrdersParams {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

// ===== Employee =====
export interface Employee {
  id: string;
  appUserId: string;
  storeId: string;
  fullName: string;
  position: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  baseSalary?: number;
  joinDate?: string;
  isActive: boolean;
  avatarUrl?: string | null;
}

export interface UpdateEmployeeProfileDto {
  fullName?: string;
  userName?: string;
  phoneNumber?: string;
}

export interface UpdateEmployeeByOwnerDto {
  fullName?: string;
  position?: string;
  baseSalary?: number;
  isActive?: boolean;
}

// ===== Task =====
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  creatorId: string;
  assigneeId?: string | null;
  assigneeName?: string;
  creatorName?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  assigneeId?: string;
}

export interface UpdateTaskDto extends CreateTaskDto {
  status: TaskStatus;
}

// ===== Inventory =====
export type InventoryTicketType = 'Import' | 'Export';
export type InventoryTicketStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface InventoryItem {
  productId: string;
  productName?: string;
  quantity: number;
  productVariantId?: string | null;
  note?: string;
}

export interface InventoryTicket {
  id: string;
  code: string;
  type: InventoryTicketType;
  status: InventoryTicketStatus;
  note?: string;
  items: InventoryItem[];
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
}

export interface CreateInventoryTicketDto {
  type: InventoryTicketType;
  note?: string;
  items: {
    productId: string;
    quantity: number;
    productVariantId?: string | null;
    note?: string;
  }[];
}

export interface GetInventoryParams {
  type?: InventoryTicketType;
  status?: InventoryTicketStatus;
  page?: number;
  pageSize?: number;
}

// ===== Customer =====
// Mirrors BE: _360Retail.Services.CRM.Application.DTOs.CustomerDto
export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  zaloId?: string | null;
  lastPurchaseDate?: string | null;
  totalPoints: number;
  rank?: string | null;
  storeId?: string | null;
}

// Mirrors BE: CreateCustomerDto
export interface CreateCustomerDto {
  fullName: string;
  phoneNumber: string;
  zaloId?: string;
}

// Mirrors BE: UpdateCustomerDto
export interface UpdateCustomerDto {
  fullName: string;
  phoneNumber: string;
  zaloId?: string;
}

// ===== Feedback =====
export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  content: string;
  rating: number; // 1-5
  source: string; // "QR" | "InStore"
  createdAt: string;
}

export interface FeedbackSummary {
  avgRating: number;
  totalCount: number;
  distribution: Record<string, number>; // {"1": 5, "2": 3, ...}
}

export interface CreateFeedbackDto {
  customerId: string;
  storeId: string;
  rating: number;
  content?: string;
}

// ===== Loyalty =====
export interface LoyaltyRule {
  id: string;
  name: string;
  type: number;
  earningRate: number;
  minSpend: number;
  status: number;
  createdAt?: string;
}

export interface CreateLoyaltyRuleDto {
  name: string;
  type: number;
  earningRate: number;
  minSpend: number;
  status: number;
}

export type UpdateLoyaltyRuleDto = CreateLoyaltyRuleDto;

export interface LoyaltySummary {
  customerId: string;
  customerName: string;
  totalPoints: number;
  rank: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId?: string;
  points: number;
  description?: string;
  type?: string;
  createdAt: string;
}

export interface RedeemPointsDto {
  points: number;
  description?: string;
}

// ===== Timekeeping =====
export interface TodayTimekeepingResponse {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isGpsConfigured: boolean;
  warning: string | null;
  record: TodayTimekeepingRecord | null;
}

export interface TodayTimekeepingRecord {
  id: string;
  employeeName: string;
  checkInTime: string;
  isLate: boolean;
  workHours: number | null;
  warning: string | null;
}

export interface TimekeepingHistoryRecord {
  id: string;
  employeeName?: string;
  checkInTime: string;
  checkOutTime?: string | null;
  isLate?: boolean;
  workHours?: number | null;
  warning?: string | null;
}

export interface CheckInDto {
  locationGps: string;
  checkInImageUrl?: string;
}

// ===== Subscription =====
export interface SubscriptionStatus {
  status: 'Registered' | 'Active' | 'Trial' | 'Inactive' | 'Suspended';
  hasStore: boolean;
  storeId: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number | null;
  planName: string | null;
  planId?: string | null;
  subscriptionEndDate?: string | null;
  isTrialExpired?: boolean;
}

export interface MySubscription {
  subscriptionId?: string;
  planName: string | null;
  price?: number;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  daysRemaining: number | null;
}

export interface Plan {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  features?: string[];
  isPopular?: boolean;
}

// ===== POS / Cart (dùng nội bộ) =====
export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

// ===== Dashboard =====
export interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

// ===== Feature Gate (403 error types) =====
export type FeatureGateErrorType = 'TrialExpired' | 'SubscriptionExpired' | 'FeatureNotAvailable';

export interface FeatureGatePayload {
  errorType: FeatureGateErrorType;
  message?: string;
  currentPlan?: string;
  requiredPlan?: string;
  feature?: string;
}
