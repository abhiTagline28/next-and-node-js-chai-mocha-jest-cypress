import { apiFetch } from "@/lib/api";

export type Student = {
  _id: string;
  user: { _id: string; name: string; email: string; role: string };
  studentId: string;
  grade: "9th" | "10th" | "11th" | "12th";
  section: "A" | "B" | "C" | "D";
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  contactNumber?: string;
  address?: Record<string, string>;
  isActive: boolean;
};

export const listStudents = (params: { page?: number; limit?: number; grade?: string; section?: string } = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.set(k, String(v));
  });
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<{ success: boolean; data: Student[]; total: number; page: number; totalPages: number }>(
    `/students${qs}`,
    { auth: true }
  );
};

export const getStudent = (id: string) =>
  apiFetch<{ success: boolean; data: Student }>(`/students/${id}`, { auth: true });

export const createStudent = (payload: Record<string, any>) =>
  apiFetch<{ success: boolean; data: Student }>(`/students`, { method: "POST", body: payload, auth: true });

export const updateStudent = (id: string, payload: Record<string, any>) =>
  apiFetch<{ success: boolean; data: Student }>(`/students/${id}`, { method: "PUT", body: payload, auth: true });

export const deleteStudent = (id: string) =>
  apiFetch<{ success: boolean; message: string }>(`/students/${id}`, { method: "DELETE", auth: true });

export const getAttendance = (id: string, params: { startDate?: string; endDate?: string } = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) search.set(k, v);
  });
  const qs = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<{ success: boolean; data: any }>(`/students/${id}/attendance${qs}`, { auth: true });
};

export const getGrades = (id: string) =>
  apiFetch<{ success: boolean; data: any }>(`/students/${id}/grades`, { auth: true });

