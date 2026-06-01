import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("portal_token")?.value ?? request.cookies.get("admin_token")?.value;

  // Portal routes: redirect to /login if not authenticated
  if (pathname.startsWith("/portal") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes: redirect to /login if not authenticated
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Legacy /admin/login: redirect to unified /login
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login", "/register", "/forgot-password"],
};
