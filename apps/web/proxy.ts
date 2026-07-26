import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("admin_token")?.value;
  const portalToken = request.cookies.get("portal_token")?.value;
  const role = request.cookies.get("user_role")?.value.trim().toLowerCase();
  if (pathname.startsWith("/admin")) {
    if (adminToken && role === "admin") return NextResponse.next();
    const redirectPath = portalToken && (role === "lawyer" || role === "user")
      ? "/portal/dashboard"
      : "/login";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!portalToken && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login", "/register", "/forgot-password"],
};
