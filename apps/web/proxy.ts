import { NextRequest, NextResponse } from "next/server";

export const SUPER_ADMIN_PORTAL_PATHS = [
  "/portal/users",
  "/portal/issuer-invitations",
  "/portal/system-reports",
  "/portal/audit-logs",
  "/portal/system-statistics",
] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("admin_token")?.value;
  const portalToken = request.cookies.get("portal_token")?.value;
  const isSuperAdminPortalPath = SUPER_ADMIN_PORTAL_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isSuperAdminPortalPath) {
    if (!portalToken) return NextResponse.redirect(new URL("/login", request.url));
    if (!adminToken) {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (adminToken) return NextResponse.next();
    const redirectPath = portalToken ? "/portal/dashboard" : "/login";
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
