import { apiFetch, setAccessToken } from "@/lib/api";

type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: { id: string; name: string; email: string; role: "student" | "teacher" | "admin" };
};

export const signup = async (payload: Record<string, any>) => {
  const res = await apiFetch<AuthResponse>("/auth/signup", { method: "POST", body: payload });
  if (res.token) setAccessToken(res.token);
  return res;
};

export const login = async (email: string, password: string) => {
  const res = await apiFetch<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  if (res.token) setAccessToken(res.token);
  return res;
};

export const forgotPassword = (email: string) =>
  apiFetch<AuthResponse>("/auth/forgot-password", { method: "POST", body: { email } });

export const resetPassword = (resetToken: string, password: string) =>
  apiFetch<AuthResponse>(`/auth/reset-password/${resetToken}`, { method: "POST", body: { password } });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<AuthResponse>("/auth/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
    auth: true,
  });

export const me = () => apiFetch<{ success: boolean; user: AuthResponse["user"] }>("/auth/me", { auth: true });

export const logout = async () => {
  await apiFetch<AuthResponse>("/auth/logout", { method: "POST", auth: true });
  setAccessToken(null);
};

