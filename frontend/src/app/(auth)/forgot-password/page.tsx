"use client";
import { useState } from "react";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await forgotPassword({ email });
      setMessage(
        res.message || "If the email exists, a reset token was generated."
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process request";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 bg-white p-8 rounded-lg shadow-lg border"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Forgot your password?
        </h1>
        {message && (
          <p className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
          </p>
        )}

        <p className="text-gray-600 text-center mb-4">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        <input
          id="email"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60 transition-colors duration-200"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <div className="text-center">
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
          >
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
}
