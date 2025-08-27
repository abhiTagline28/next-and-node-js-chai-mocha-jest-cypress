"use client";
import { useEffect, useState } from "react";
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  Student,
} from "@/services/students";
import { me } from "@/services/auth";

export default function StudentsPage() {
  const [data, setData] = useState<{
    data: Student[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    grade: "9th" as "9th" | "10th" | "11th" | "12th",
    section: "A" as "A" | "B" | "C" | "D",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    contactNumber: "",
    address: "",
  });

  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await listStudents({ page: 1, limit: 50 });
      setData(result);
      setError(null);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const userData = await me();
      setUserRole(userData.user?.role || null);
    } catch (error) {
      console.error("Failed to load user role:", error);
    }
  };

  useEffect(() => {
    loadStudents();
    loadUserRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, formData);
      } else {
        await createStudent(formData);
      }
      setShowForm(false);
      setEditingStudent(null);
      resetForm();
      await loadStudents();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.user.name,
      email: student.user.email,
      password: "",
      grade: student.grade,
      section: student.section,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      contactNumber: student.contactNumber || "",
      address: student.address ? Object.values(student.address).join(", ") : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    setLoading(true);
    try {
      await deleteStudent(id);
      await loadStudents();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      grade: "9th" as "9th" | "10th" | "11th" | "12th",
      section: "A" as "A" | "B" | "C" | "D",
      dateOfBirth: "",
      gender: "male" as "male" | "female" | "other",
      contactNumber: "",
      address: "",
    });
  };

  const openCreateForm = () => {
    setEditingStudent(null);
    resetForm();
    setShowForm(true);
  };

  // Check if user has permission to perform CRUD operations
  const canManageStudents = userRole === "admin";
  const canViewStudents = userRole === "admin" || userRole === "teacher";

  if (!canViewStudents) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          You don&apos;t have permission to view students.
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
        {error}
      </div>
    );
  if (loading && !data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        {canManageStudents && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Add Student
          </button>
        )}
      </div>

      {showForm && canManageStudents && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {editingStudent ? "Edit Student" : "Add New Student"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grade: e.target.value as "9th" | "10th" | "11th" | "12th",
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      section: e.target.value as "A" | "B" | "C" | "D",
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as "male" | "female" | "other",
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingStudent ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Grade/Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                {canManageStudents && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {student.user?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {student.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {student.grade} - {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">
                    {student.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {student.contactNumber || "-"}
                  </td>
                  {canManageStudents && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No students found.{" "}
            {canManageStudents && "Add your first student to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
