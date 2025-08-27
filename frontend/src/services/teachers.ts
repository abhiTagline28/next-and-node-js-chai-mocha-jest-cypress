import { apiFetch } from "@/lib/api";

export type Teacher = {
  _id: string;
  user: { _id: string; name: string; email: string; role: string };
  teacherId: string;
  department: string;
  qualification: string;
  experience?: number;
  specialization?: string[];
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  contactNumber?: string;
  salary?: number;
  isActive: boolean;
};

export const listTeachers = (params: { page?: number; limit?: number; department?: string } = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.set(k, String(v));
  });
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<{ success: boolean; data: Teacher[]; total: number; page: number; totalPages: number }>(
    `/teachers${qs}`,
    { auth: true }
  );
};

export const getTeacher = (id: string) =>
  apiFetch<{ success: boolean; data: Teacher }>(`/teachers/${id}`, { auth: true });

export const createTeacher = (payload: Record<string, any>) =>
  apiFetch<{ success: boolean; data: Teacher }>(`/teachers`, { method: "POST", body: payload, auth: true });

export const updateTeacher = (id: string, payload: Record<string, any>) =>
  apiFetch<{ success: boolean; data: Teacher }>(`/teachers/${id}`, { method: "PUT", body: payload, auth: true });

export const deleteTeacher = (id: string) =>
  apiFetch<{ success: boolean; message: string }>(`/teachers/${id}`, { method: "DELETE", auth: true });

export const listByDepartment = (department: string, params: { page?: number; limit?: number } = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.set(k, String(v));
  });
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<{ success: boolean; department: string; teachers: Teacher[]; total: number; page: number; totalPages: number }>(
    `/teachers/department/${department}${qs}`,
    { auth: true }
  );
};

export const getStats = () => apiFetch<{ success: boolean; data: any }>(`/teachers/stats/overview`, { auth: true });

