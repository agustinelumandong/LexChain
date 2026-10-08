import { NextResponse } from "next/server";
import { backendUrl } from "@/server/api/backend";
import { signUpRequestSchema } from "@/features/auth";

function getErrorMessage(payload: unknown, status: number) {
  const fallback = status === 422
    ? "Please check the signup details and try again."
    : status === 429
      ? "Too many signup attempts. Please wait before trying again."
      : status >= 500
        ? "The signup service is temporarily unavailable. Try again shortly."
        : "Sign up failed. Check your details or use another email address.";
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }
  const body = payload as Record<string, unknown>;
  if (typeof body.detail === "string") return body.detail;
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  if (Array.isArray(body.detail)) {
    const messages = body.detail.flatMap((issue) =>
      typeof issue === "object" && issue !== null && "msg" in issue && typeof issue.msg === "string"
        ? [issue.msg]
        : [],
    );
    if (messages.length) return messages.join(" ");
  }
  return fallback;
}

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

  const signup = signUpRequestSchema.safeParse(body);
  if (!signup.success) {
    return NextResponse.json({ message: signup.error.issues[0]?.message ?? "Check your signup details." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl("/auth/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(signup.data),
    });
  } catch {
    return NextResponse.json({ message: "Unable to reach the API." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, upstream.status) },
      { status: upstream.status },
    );
  }

  const result = typeof payload === "object" && payload !== null && !Array.isArray(payload) ? payload : {};
  return NextResponse.json({ ok: true, ...result }, { status: upstream.status });
}
