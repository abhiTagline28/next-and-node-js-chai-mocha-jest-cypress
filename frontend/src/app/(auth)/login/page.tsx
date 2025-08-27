"use client";
import { useState } from "react";
import { login } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing errors
    setError(null);

    // Client-side validation
    if (
      !form.email ||
      !form.email.trim() ||
      !form.email.includes("@") ||
      !form.email.includes(".") ||
      form.email.indexOf("@") === 0 ||
      form.email.indexOf("@") === form.email.length - 1
    ) {
      setError("Please enter a valid email");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 bg-card p-8 rounded-lg shadow-lg border border-border"
      >
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">
          Sign in to your account
        </h1>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </p>
        )}

        <input
          id="email"
          className="w-full border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          id="password"
          className="w-full border border-border rounded-lg px-4 py-3 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60 transition-colors duration-200"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center space-y-2">
          <a
            href="/forgot-password"
            className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
          >
            Forgot your password?
          </a>
          <a
            href="/signup"
            className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
          >
            Don&apos;t have an account? Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
