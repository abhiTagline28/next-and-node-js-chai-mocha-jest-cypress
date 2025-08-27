"use client";
import { useEffect, useState } from "react";
import {
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  Teacher,
} from "@/services/teachers";
import { me } from "@/services/auth";

export default function TeachersPage() {
  const [data, setData] = useState<{
    data: Teacher[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    qualification: "",
    experience: "",
    specialization: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    contactNumber: "",
    salary: "",
  });

  // Department and qualification options from backend validation
  const departmentOptions = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
    "Arts",
    "Music",
    "Other",
  ];

  const qualificationOptions = [
    "Bachelor",
    "Masters",
    "PhD",
    "Diploma",
    "Other",
  ];

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const result = await listTeachers({ page: 1, limit: 50 });
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
    loadTeachers();
    loadUserRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher._id, formData);
      } else {
        await createTeacher(formData);
      }
      setShowForm(false);
      setEditingTeacher(null);
      resetForm();
      await loadTeachers();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.user.name,
      email: teacher.user.email,
      password: "",
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience?.toString() || "",
      specialization: teacher.specialization?.join(", ") || "",
      dateOfBirth: teacher.dateOfBirth,
      gender: teacher.gender,
      contactNumber: teacher.contactNumber || "",
      salary: teacher.salary?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    setLoading(true);
    try {
      await deleteTeacher(id);
      await loadTeachers();
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
      department: "",
      qualification: "",
      experience: "",
      specialization: "",
      dateOfBirth: "",
      gender: "male",
      contactNumber: "",
      salary: "",
    });
  };

  const openCreateForm = () => {
    setEditingTeacher(null);
    resetForm();
    setShowForm(true);
  };

  // Check if user has permission to perform CRUD operations
  const canManageTeachers = userRole === "admin";
  const canViewTeachers = userRole === "admin" || userRole === "teacher";

  if (!canViewTeachers) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          You don&apos;t have permission to view teachers.
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
        <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
        {canManageTeachers && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Add Teacher
          </button>
        )}
      </div>

      {showForm && canManageTeachers && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
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
              {!editingTeacher && (
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
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Qualification
                </label>
                <select
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Qualification</option>
                  {qualificationOptions.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra, Calculus, Geometry"
                />
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Salary
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTeacher(null);
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
                {loading ? "Saving..." : editingTeacher ? "Update" : "Create"}
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Qualification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Experience
                </th>
                {canManageTeachers && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((teacher) => (
                <tr
                  key={teacher._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {teacher.user?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {teacher.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {teacher.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {teacher.qualification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {teacher.experience ? `${teacher.experience} years` : "-"}
                  </td>
                  {canManageTeachers && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
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
            No teachers found.{" "}
            {canManageTeachers && "Add your first teacher to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
