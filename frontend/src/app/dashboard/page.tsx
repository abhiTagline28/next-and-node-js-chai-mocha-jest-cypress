"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout } from "@/services/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    me()
      .then((r) => setUser(r.user || null))
      .catch((e) => setError(e.message));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <button
          data-testid="logout-button"
          className="px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-md transition-colors border border-border"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </p>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          User Information
        </h2>
        {user && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Welcome, {user.name || user.email}
            </h3>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground font-medium min-w-[80px]">
              Name:
            </span>
            <span className="text-foreground">
              {user?.name || "Loading..."}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground font-medium min-w-[80px]">
              Email:
            </span>
            <span className="text-foreground">
              {user?.email || "Loading..."}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground font-medium min-w-[80px]">
              Role:
            </span>
            <span className="text-foreground capitalize">
              {user?.role || "Loading..."}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {/* Student Management - Show for admin and teacher */}
        {(user?.role === "admin" || user?.role === "teacher") && (
          <Link
            className="bg-card border border-border rounded-lg p-6 block hover:bg-muted/50 transition-colors group"
            href="/students"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Student Management
              </h3>
              <p className="text-muted-foreground">
                Manage student records and information
              </p>
            </div>
          </Link>
        )}

        {/* Teacher Management - Show for admin only */}
        {user?.role === "admin" && (
          <Link
            className="bg-card border border-border rounded-lg p-6 block hover:bg-muted/50 transition-colors group"
            href="/teachers"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Teacher Management
              </h3>
              <p className="text-muted-foreground">
                Manage teacher records and departments
              </p>
            </div>
          </Link>
        )}

        {/* Analytics & Reports - Show for admin only */}
        {user?.role === "admin" && (
          <Link
            className="bg-card border border-border rounded-lg p-6 block hover:bg-muted/50 transition-colors group"
            href="/analytics"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 transition-colors">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analytics & Reports
              </h3>
              <p className="text-muted-foreground">
                View performance metrics and generate reports
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
