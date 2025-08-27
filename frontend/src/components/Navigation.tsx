"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { me } from "@/services/auth";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    me()
      .then((r) => setUser(r.user || null))
      .catch((e) => console.error("Failed to get user info:", e));
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    // Only show Students for admin and teacher
    ...(user?.role === "admin" || user?.role === "teacher"
      ? [{ href: "/students", label: "Students" }]
      : []),
    // Only show Teachers for admin
    ...(user?.role === "admin"
      ? [{ href: "/teachers", label: "Teachers" }]
      : []),
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-foreground">
                School Management
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {/* Logout button removed - dashboard has its own logout button */}
          </div>
        </div>
      </div>
    </nav>
  );
}
