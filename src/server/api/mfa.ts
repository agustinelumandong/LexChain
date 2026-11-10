import { NextResponse, type NextRequest } from "next/server";
import { backendUrl } from "@/server/api/backend";

export function pendingToken(request: NextRequest) {
  return request.cookies.get("mfa_token")?.value;
}

export function clearPending(response: NextResponse) {
  for (const name of ["mfa_token", "mfa_remember"]) {
    response.cookies.set(name, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  }
  return response;
}

export async function mfaRequest(path: string, token: string, body?: unknown) {
  try {
    return await fetch(backendUrl(path), {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    return null;
  }
}

export async function mfaError(response: Response | null) {
  if (!response) return NextResponse.json({ message: "Could not connect to LexChain. Please try again." }, { status: 502 });
  const payload: unknown = await response.json().catch(() => null);
  const detail = typeof payload === "object" && payload !== null && "detail" in payload && typeof payload.detail === "string" ? payload.detail : "Unable to complete verification.";
  return NextResponse.json({ message: detail }, { status: response.status });
}

