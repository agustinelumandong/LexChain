import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/admin-api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true" || process.env.USE_MOCK_API === "true";
const mockPassword = "Password123";
const mockAccounts = [
  { id: "mock-admin", email: "admin@example.com", role: "admin", name: "LexChain Admin" },
  { id: "mock-lawyer", email: "lawyer@example.com", role: "lawyer", name: "LexChain Lawyer" },
  { id: "mock-user", email: "user@example.com", role: "user", name: "LexChain User" },
  { id: "mock-owner", email: "owner@lexchain.local", role: "admin", name: "LexChain Owner" },
] as const;

function createSessionResponse(token: string, maxAge: number, user: { role?: string; email?: string; name?: string; id?: string }) {
  const response = NextResponse.json({ ok: true, user });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };

  response.cookies.set({ name: "admin_token", value: token, ...cookieOpts });
  response.cookies.set({ name: "portal_token", value: token, ...cookieOpts });
  // Non-httpOnly so middleware can read it for RBAC
  response.cookies.set({ name: "user_role", value: user.role ?? "", httpOnly: false, secure: cookieOpts.secure, sameSite: cookieOpts.sameSite, maxAge, path: "/" });

  return response;
}

export async function POST(request: Request) {
  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase && !useMock) {
    return NextResponse.json({ message: "Missing API_URL." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  // Mock mode
  if (useMock) {
    const credentials = body as { email?: unknown; password?: unknown };
    const email = typeof credentials.email === "string" ? credentials.email.toLowerCase() : "";
    const password = typeof credentials.password === "string" ? credentials.password : "";
    const account = mockAccounts.find((a) => a.email === email);

    if (!account || password !== mockPassword) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    return createSessionResponse(`mock-token:${account.id}`, 60 * 60 * 24, account);
  }

  // Real backend
  let upstream: Response;
  try {
    upstream = await fetch(backendUrl("/auth/signin"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: "Unable to reach the API." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      { message: payload?.detail ?? payload?.message ?? "Login failed." },
      { status: upstream.status },
    );
  }

  const token: string | undefined = payload?.access_token ?? payload?.token;
  if (!token) {
    return NextResponse.json(
      { message: "Login succeeded, but no token was returned." },
      { status: 502 },
    );
  }

  const maxAge = payload?.expires_in ?? 60 * 60 * 24;
  const rawUser = payload?.user ?? {};

  // Fetch the actual user profile to get the real app role
  let appRole = "";
  try {
    const meRes = await fetch(backendUrl("/users/"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });
    if (meRes.ok) {
      const me = await meRes.json();
      appRole = me?.role ?? "";
    }
  } catch { /* ignore */ }

  const name = rawUser.user_metadata?.full_name
    ?? rawUser.user_metadata?.name
    ?? (`${rawUser.user_metadata?.f_name ?? ""} ${rawUser.user_metadata?.l_name ?? ""}`.trim() || rawUser.email);

  const user = {
    id: rawUser.id ?? rawUser.sub,
    email: rawUser.email,
    name,
    role: appRole || rawUser.role || "",
  };

  return createSessionResponse(token, maxAge, user);
}
