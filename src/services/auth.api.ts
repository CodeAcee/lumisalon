import { api } from '../lib/api-client';
import type {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  ForgotPasswordRequest,
  UserResponse,
  UpdateProfileRequest,
  UploadAvatarResponse,
} from '../types/dto';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  signUp: (data: SignUpRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<{ message: string }>('/auth/forgot-password', data),

  getProfile: () =>
    api.get<UserResponse>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UserResponse>('/auth/profile', data),

  uploadAvatar: (formData: FormData) =>
    api.post<UploadAvatarResponse>('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAccount: () =>
    api.delete<{ message: string }>('/auth/account'),
};
