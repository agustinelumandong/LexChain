import { NextResponse } from "next/server";

function isIssuerRole(role?: unknown) {
  return typeof role === "string" && ["document_issuer", "lawyer", "admin", "super_admin"].includes(role.trim().toLowerCase());
}

export function createSessionResponse(token: string, maxAge: number | undefined, user: { role?: string; email?: string; name?: string; id?: string }) {
  const response = NextResponse.json({ ok: true, user });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    ...(maxAge === undefined ? {} : { maxAge }),
    path: "/",
  };

  const issuer = isIssuerRole(user.role);
  response.cookies.set({
    name: "issuer_token",
    value: issuer ? token : "",
    ...cookieOpts,
    maxAge: issuer ? maxAge : 0,
  });
  response.cookies.set({ name: "portal_token", value: token, ...cookieOpts });
  response.cookies.set({ name: "admin_token", value: "", ...cookieOpts, maxAge: 0 });
  response.cookies.set({ name: "mfa_token", value: "", ...cookieOpts, maxAge: 0 });
  response.cookies.set({ name: "mfa_remember", value: "", ...cookieOpts, maxAge: 0 });
  // Client-readable routing hint only; authorization uses server-only cookies.
  response.cookies.set({
    name: "user_role",
    value: issuer ? "lawyer" : user.role ?? "",
    httpOnly: false,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge,
    path: "/",
  });

  return response;
}

