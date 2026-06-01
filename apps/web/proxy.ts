import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin", "owner"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("portal_token")?.value ?? request.cookies.get("admin_token")?.value;
  const role = request.cookies.get("user_role")?.value ?? "";
  const isAdmin = ADMIN_ROLES.has(role.toLowerCase());

  // Legacy /admin/login → unified /login
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Unauthenticated: redirect to /login
  if (!token) {
    if (pathname.startsWith("/portal") || (pathname.startsWith("/admin") && pathname !== "/admin/login")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin trying to access portal → redirect to admin dashboard
  if (isAdmin && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Non-admin trying to access admin → redirect to portal dashboard
  if (!isAdmin && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/portal/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login", "/register", "/forgot-password"],
};
