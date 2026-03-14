// =============================================
// Plan Config — Cấu hình gói đăng ký
// Single source of truth cho limits & features
// =============================================

export type PlanName = 'Trial' | 'Basic' | 'Pro' | 'Yearly';

// Feature flags — tính năng bật/tắt theo gói
export type FeatureKey =
  | 'productVariants' // Biến thể sản phẩm
  | 'dashboard' // Dashboard thống kê
  | 'gpsAttendance' // Chấm công GPS
  | 'tasks' // Quản lý công việc
  | 'feedbackQR' // Feedback QR
  | 'loyalty' // Chương trình loyalty
  | 'exportExcel' // Xuất file Excel
  | 'inviteByEmail' // Mời nhân viên qua email
  | 'multiStore' // Quản lý nhiều cửa hàng
  | 'inventory'; // Quản lý kho hàng

// Giới hạn số lượng — numeric limits
export interface PlanLimits {
  maxProducts: number; // Số sản phẩm tối đa
  maxStaff: number; // Số nhân viên tối đa
  maxOrdersPerMonth: number; // Số đơn hàng / tháng
}

export interface PlanConfig {
  name: PlanName;
  label: string; // Tên hiển thị
  price: string; // Giá hiển thị
  limits: PlanLimits;
  features: Record<FeatureKey, boolean>;
}

// ∞ = Infinity
const INF = Infinity;

export const PLAN_CONFIGS: Record<PlanName, PlanConfig> = {
  Trial: {
    name: 'Trial',
    label: 'Dùng thử',
    price: 'Miễn phí (7 ngày)',
    limits: { maxProducts: 50, maxStaff: 3, maxOrdersPerMonth: 100 },
    features: {
      productVariants: false,
      dashboard: false,
      gpsAttendance: false,
      tasks: false,
      feedbackQR: false,
      loyalty: false,
      exportExcel: false,
      inviteByEmail: false,
      multiStore: false,
      inventory: false, // Kho hàng — ẩn với gói Trial
    },
  },

  Basic: {
    name: 'Basic',
    label: 'Cơ bản',
    price: '199.000đ/tháng',
    limits: { maxProducts: 200, maxStaff: 10, maxOrdersPerMonth: 500 },
    features: {
      productVariants: true,
      dashboard: true,
      gpsAttendance: false,
      tasks: true,
      feedbackQR: false,
      loyalty: false,
      exportExcel: false,
      inviteByEmail: true,
      multiStore: false,
      inventory: true,
    },
  },

  Pro: {
    name: 'Pro',
    label: 'Chuyên nghiệp',
    price: '499.000đ/tháng',
    limits: { maxProducts: INF, maxStaff: 20, maxOrdersPerMonth: 2000 },
    features: {
      productVariants: true,
      dashboard: true,
      gpsAttendance: true,
      tasks: true,
      feedbackQR: true,
      loyalty: true,
      exportExcel: true,
      inviteByEmail: true,
      multiStore: false,
      inventory: true,
    },
  },

  // Yearly = Pro features + nhân viên 50 + đơn hàng ∞ + giá ưu đãi ~17%
  Yearly: {
    name: 'Yearly',
    label: 'Theo năm',
    price: '4.990.000đ/năm',
    limits: { maxProducts: INF, maxStaff: 50, maxOrdersPerMonth: INF },
    features: {
      productVariants: true,
      dashboard: true,
      gpsAttendance: true,
      tasks: true,
      feedbackQR: true,
      loyalty: true,
      exportExcel: true,
      inviteByEmail: true,
      multiStore: true,
      inventory: true,
    },
  },
};

// Helper: lấy config theo planName (case-insensitive, fallback Trial nếu null/unknown)
export function getPlanConfig(planName: string | null): PlanConfig {
  if (!planName) return PLAN_CONFIGS.Trial;

  // Tìm config matching case-insensitive (ví dụ: "yearly" → "Yearly")
  const normalizedKey = Object.keys(PLAN_CONFIGS).find(
    (key) => key.toLowerCase() === planName.toLowerCase()
  ) as PlanName | undefined;

  if (normalizedKey) {
    return PLAN_CONFIGS[normalizedKey];
  }

  console.warn(`[PlanConfig] Unknown planName: "${planName}", fallback to Trial`);
  return PLAN_CONFIGS.Trial;
}

// Feature labels — tên hiển thị cho từng tính năng
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  productVariants: 'Biến thể sản phẩm',
  dashboard: 'Dashboard thống kê',
  gpsAttendance: 'Chấm công GPS',
  tasks: 'Quản lý công việc',
  feedbackQR: 'Feedback QR',
  loyalty: 'Chương trình Loyalty',
  exportExcel: 'Xuất Excel',
  inviteByEmail: 'Mời NV qua email',
  multiStore: 'Quản lý nhiều cửa hàng',
  inventory: 'Quản lý kho hàng',
};

// Gói tối thiểu cần để dùng feature
export const FEATURE_MIN_PLAN: Record<FeatureKey, PlanName> = {
  productVariants: 'Basic',
  dashboard: 'Basic',
  gpsAttendance: 'Pro',
  tasks: 'Basic',
  feedbackQR: 'Pro',
  loyalty: 'Pro',
  exportExcel: 'Pro',
  inviteByEmail: 'Basic',
  multiStore: 'Yearly',
  inventory: 'Basic',
};

/**
 * Menu Screen -> Feature Key mapping
 * Dùng để filter menu items theo feature availability
 */
export const MENU_FEATURE_MAP: Record<string, FeatureKey | null> = {
  // Navigation screen -> feature gate key (null = no gate)
  'Timekeeping': 'gpsAttendance', // Chấm công GPS → requires Pro+
  'MyTasks': 'tasks',            // Công việc → requires Basic+
  'TaskManagement': 'tasks',
  'StaffManagement': null,       // Quản lý nhân sự — no gate
  'EmployeeManagement': null,
  'StoreManagement': null,       // Quản lý cửa hàng — no gate
  'ProductManagement': null,     // Sản phẩm luôn truy cập (giống web sidebar)
  'InventoryManagement': 'inventory', // Kho hàng — requires Basic+
  'CustomerManagement': null,    // Khách hàng — no gate
  'Feedback': 'feedbackQR',
  'Loyalty': 'loyalty',
  'CrmDashboard': 'loyalty',     // CRM & Loyalty → requires Pro+ (for loyalty)
  'Reports': 'exportExcel',      // Báo cáo → requires Pro+ (for export)
  'Settings': null,              // Cài đặt — no gate
  'Subscription': null,          // Gói đăng ký — no gate (only for owner)
  'Payment': null,
};
