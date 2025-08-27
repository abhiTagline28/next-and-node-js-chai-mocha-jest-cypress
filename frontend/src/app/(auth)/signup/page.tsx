"use client";
import { useState } from "react";
import { signup } from "@/services/auth";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher" | "admin";

interface FormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  grade: string;
  section: string;
  department: string;
  qualification: string;
  experience: string;
  specialization: string;
  salary: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "student",
    grade: "10th",
    section: "A",
    department: "Mathematics",
    qualification: "Masters",
    experience: "",
    specialization: "",
    salary: "",
    dateOfBirth: "1990-01-01",
    gender: "other",
    contactNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const update = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg space-y-4 bg-card p-8 rounded-lg shadow-lg border border-border"
      >
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">
          Sign up
        </h1>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input
            id="name"
            className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <input
            id="email"
            className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <input
            id="password"
            className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />

          <select
            id="role"
            className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={role}
            onChange={(e) => {
              const r = e.target.value as Role;
              setRole(r);
              update("role", r);
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          {role === "student" && (
            <>
              <select
                id="grade"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.grade}
                onChange={(e) => update("grade", e.target.value)}
              >
                {["9th", "10th", "11th", "12th"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                id="section"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.section}
                onChange={(e) => update("section", e.target.value)}
              >
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          )}

          {role === "teacher" && (
            <>
              <select
                id="department"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select
                id="qualification"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.qualification}
                onChange={(e) => update("qualification", e.target.value)}
                required
              >
                <option value="">Select Qualification</option>
                {qualificationOptions.map((qual) => (
                  <option key={qual} value={qual}>
                    {qual}
                  </option>
                ))}
              </select>
              <input
                id="experience"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Years of Experience"
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
              />
              <input
                id="specialization"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Specialization"
                value={form.specialization}
                onChange={(e) => update("specialization", e.target.value)}
              />
              <input
                id="salary"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) => update("salary", e.target.value)}
              />
            </>
          )}

          {(role === "student" || role === "teacher") && (
            <>
              <input
                id="dateOfBirth"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
              <select
                id="gender"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                {["male", "female", "other"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <input
                id="contactNumber"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
              />
              <input
                id="address"
                className="border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60 transition-colors duration-200"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
        <div className="text-center">
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
}
