// =============================================
// Navigation Types — Khai báo params cho từng Stack/Tab
// =============================================

import type { CartItem } from '@/src/types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ──────────── Auth Stack ────────────
export type AuthStackParamList = {
  Introduction: undefined;
  Login: undefined;
  Signup: undefined;
  OTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

// ──────────── Main Bottom Tabs ────────────
export type MainTabParamList = {
  Home: undefined;
  Rentals: undefined;
  Orders: undefined;
  More: undefined;
  ProfileStack: undefined;
};

// ──────────── POS Stack ────────────
export type RentalsStackParamList = {
  POS: undefined;
  Checkout: { cart: CartItem[]; onComplete?: () => void };
};

// ──────────── Profile Stack ────────────
export type ProfileStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
  SalesReport: undefined;
};

// ──────────── More Stack (management screens) ────────────
export type MoreStackParamList = {
  MoreMenu: undefined;
  StaffManagement: undefined;
  EmployeeDetail: { employeeId: string };
  StoreManagement: undefined;
  ProductManagement: undefined;
  ProductForm: { productId?: string };
  CategoryForm: { categoryId?: string };
  InventoryManagement: undefined;
  InventoryDetail: { ticketId: string };
  InventoryForm: { ticketId?: string };
  CustomerManagement: undefined;
  EmployeeManagement: undefined;
  Feedback: undefined;
  TaskManagement: undefined;
  Loyalty: undefined;
  Payment: undefined;
  CrmDashboard: undefined;
  Reports: undefined;
  MyTasks: undefined;
  Timekeeping: undefined;
  Settings: undefined;
  Subscription: undefined;
};
