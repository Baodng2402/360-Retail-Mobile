import { z } from 'zod';

// ==========================================
// ĐỊNH NGHĨA REGEX TỪ BACKEND
// ==========================================

// Password: 8-100 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
export const PASSWORD_ERROR_MSG = 'Mật khẩu từ 8-100 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.';

// Phone: Chuẩn Việt Nam (10 số, bắt đầu 0 hoặc +84)
export const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
export const PHONE_ERROR_MSG = 'Số điện thoại không hợp lệ (VD: 0912345678).';

// OTP: Đúng 6 số
export const OTP_REGEX = /^\d{6}$/;
export const OTP_ERROR_MSG = 'Mã OTP phải gồm đúng 6 chữ số.';

// Date (ISO 8601 DateOnly string: YYYY-MM-DD)
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_ERROR_MSG = 'Ngày phải đúng định dạng YYYY-MM-DD.';

// ==========================================
// CÁC TRƯỜNG CƠ BẢN (BASE FIELDS)
// ==========================================

export const baseStringValidator = z.string().trim().min(2, 'Vui lòng nhập ít nhất 2 ký tự').max(100, 'Tối đa 100 ký tự');
export const longStringValidator = z.string().trim().min(2, 'Vui lòng nhập ít nhất 2 ký tự').max(200, 'Tối đa 200 ký tự');
export const emailValidator = z.string().trim().email('Email không đúng định dạng').max(255);
export const passwordValidator = z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MSG);
export const phoneValidator = z.string().trim().regex(PHONE_REGEX, PHONE_ERROR_MSG);
export const optionalPhoneValidator = z.union([phoneValidator, z.literal(''), z.null(), z.undefined()]).optional();
export const otpValidator = z.string().trim().regex(OTP_REGEX, OTP_ERROR_MSG);
export const positiveNumberValidator = z.number().min(0, 'Giá trị không được âm');
export const positiveIntValidator = z.number().int().min(1, 'Giá trị phải lớn hơn 0');
export const ratingValidator = z.number().min(1, 'Đánh giá tối thiểu 1').max(5, 'Đánh giá tối đa 5');
export const dateStringValidator = z.string().regex(DATE_REGEX, DATE_ERROR_MSG);

// ==========================================
// SCHEMAS CHO CÁC FORM CỤ THỂ
// ==========================================

// 1. Auth & Identity
export const LoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'), // Khi login ko cần check độ phức tạp mạnh
});

export const RegisterOwnerSchema = z.object({
  fullName: baseStringValidator,
  phone: phoneValidator,
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: passwordValidator,
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmNewPassword'],
});

// 2. Stores (Cửa hàng)
export const CreateStoreSchema = z.object({
  storeName: longStringValidator,
  address: longStringValidator.optional().or(z.literal('')),
  phone: optionalPhoneValidator,
  planId: z.string().optional(),
});

// 3. Nhân sự (HR)
export const EmployeeSchema = z.object({
  fullName: baseStringValidator,
  email: emailValidator,
  phone: optionalPhoneValidator,
  role: z.enum(['Staff', 'Manager'], { message: 'Vui lòng chọn chức vụ hợp lệ' }),
  joinDate: dateStringValidator.optional().or(z.literal('')),
});

// 4. CRM / CrmCustomer
export const CustomerSchema = z.object({
  fullName: baseStringValidator,
  phoneNumber: phoneValidator,
  zaloId: z.string().max(100).optional().or(z.literal('')),
});

// 5. Products & Orders
export const ProductSchema = z.object({
  name: baseStringValidator,
  sellingPrice: positiveNumberValidator,
  originalPrice: positiveNumberValidator.optional(),
  imageUrl: longStringValidator.optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().max(2000, 'Mô tả tối đa 2000 ký tự').optional(),
});

export const CategorySchema = z.object({
  name: baseStringValidator,
  description: longStringValidator.optional(),
});

// Helper Types mapping từ Zod (Dùng để thay thế generic Form state nếu cần)
export type LoginFormType = z.infer<typeof LoginSchema>;
export type RegisterFormType = z.infer<typeof RegisterOwnerSchema>;
export type ChangePasswordFormType = z.infer<typeof ChangePasswordSchema>;
export type CreateStoreFormType = z.infer<typeof CreateStoreSchema>;
export type EmployeeFormType = z.infer<typeof EmployeeSchema>;
export type CustomerFormType = z.infer<typeof CustomerSchema>;
export type ProductFormType = z.infer<typeof ProductSchema>;
