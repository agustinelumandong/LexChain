import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("portal_token")?.value ?? request.cookies.get("admin_token")?.value;
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(token ? "/portal/dashboard" : "/login", request.url));
  }

  if (!token && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login", "/register", "/forgot-password"],
};
