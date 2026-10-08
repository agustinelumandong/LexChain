import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/config/api";
import { isMockMode } from "@/lib/mocks/mode";
import { backendUrl } from "@/server/api/backend";

const sessionCookies = ["portal_token", "issuer_token", "admin_token", "user_role"] as const;

export async function signOut(request?: NextRequest) {
  const token = ["issuer_token", "portal_token", "admin_token"]
    .map((name) => request?.cookies.get(name)?.value)
    .find(Boolean);

  if (token && !isMockMode() && getApiBaseUrl(process.env)) {
    try {
      await fetch(backendUrl("/auth/signout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Local session cleanup must complete if the backend is unavailable.
    }
  }

  const response = NextResponse.json({ ok: true });
  for (const name of sessionCookies) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: name !== "user_role",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }
  return response;
}
