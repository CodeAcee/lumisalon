import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(7, 'Phone number is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignUpFormData = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ukrainianPhone = z
  .string()
  .refine(
    (val) => /^\+380\d{9}$/.test(val),
    'Enter valid Ukrainian phone: +380 XX XXX XXXX',
  );

const ukrainianPhoneOptional = z
  .string()
  .refine(
    (val) => !val || /^\+380\d{9}$/.test(val),
    'Enter valid Ukrainian phone: +380 XX XXX XXXX',
  )
  .optional()
  .or(z.literal(''));

export const clientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: ukrainianPhone,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});
export type ClientFormData = z.infer<typeof clientSchema>;

export const masterSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: ukrainianPhoneOptional,
  positions: z.array(z.string()).min(1, 'Select at least one position'),
});
export type MasterFormData = z.infer<typeof masterSchema>;

export const procedureSchema = z.object({
  masterId: z.string().min(1, 'Select a master'),
  clientId: z.string().min(1, 'Select a client'),
  positions: z.array(z.string()).min(1, 'Select at least one service'),
  notes: z.string().optional(),
});
export type ProcedureFormData = z.infer<typeof procedureSchema>;

export const editProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: ukrainianPhoneOptional,
});
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
