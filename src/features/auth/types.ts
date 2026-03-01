import { z } from 'zod';

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

