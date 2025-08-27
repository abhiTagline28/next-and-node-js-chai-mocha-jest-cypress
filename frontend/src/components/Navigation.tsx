"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth";

export default function Navigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/teachers", label: "Teachers" },
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm font-medium text-foreground bg-muted hover:bg-accent transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
