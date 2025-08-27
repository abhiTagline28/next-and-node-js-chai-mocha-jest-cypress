import { apiFetch, setAccessToken } from "@/lib/api";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  grade?: string;
  section?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  specialization?: string;
  salary?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  address?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Real API implementation
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data
  });
  setAccessToken(response.token);
  return response;
};

export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: data
  });
  setAccessToken(response.token);
  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      auth: true
    });
  } finally {
    setAccessToken(null);
  }
};

export const me = async (): Promise<AuthResponse> => {
  return await apiFetch<AuthResponse>('/auth/me', {
    auth: true
  });
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: data
  });
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>(`/auth/reset-password/${data.token}`, {
    method: 'POST',
    body: {
      password: data.password,
      confirmPassword: data.confirmPassword
    }
  });
};

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<AuthResponse>("/auth/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
    auth: true,
  });

