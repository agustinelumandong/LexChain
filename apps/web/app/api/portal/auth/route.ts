import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/admin-api";

export async function POST(request: Request) {
  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return NextResponse.json({ message: "Missing API_URL." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

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

  const response = NextResponse.json({ ok: true, user: payload?.user ?? null });
  response.cookies.set({
    name: "portal_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return response;
}
