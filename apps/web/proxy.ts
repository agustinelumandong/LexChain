import { NextRequest, NextResponse } from "next/server";

export const SUPER_ADMIN_PORTAL_PATHS = [
  "/portal/users",
  "/portal/issuer-invitations",
  "/portal/system-reports",
  "/portal/audit-logs",
  "/portal/system-statistics",
] as const;

const LEGACY_ADMIN_REDIRECTS: Record<string, string> = {
  "/admin/dashboard": "/portal/dashboard",
  "/admin/users": "/portal/users",
  "/admin/invitations-permissions": "/portal/issuer-invitations",
  "/admin/generated-reports": "/portal/system-reports",
  "/admin/audit-logs": "/portal/audit-logs",
  "/admin/login": "/login",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("admin_token")?.value;
  const portalToken = request.cookies.get("portal_token")?.value;
  const isSuperAdminPortalPath = SUPER_ADMIN_PORTAL_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const destination = LEGACY_ADMIN_REDIRECTS[pathname] ?? "/portal/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isSuperAdminPortalPath) {
    if (!portalToken) return NextResponse.redirect(new URL("/login", request.url));
    if (!adminToken) {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!portalToken && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login", "/register", "/forgot-password"],
};
