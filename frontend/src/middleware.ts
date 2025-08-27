import { NextResponse, type NextRequest } from "next/server";

// Public routes that do not require auth
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/assets");

  // Read token from cookie set by client utils
  const token = req.cookies.get("access_token")?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting login/signup, redirect to dashboard
  if (isPublic && token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

