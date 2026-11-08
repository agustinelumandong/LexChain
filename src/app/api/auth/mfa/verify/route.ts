import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSessionResponse } from "@/server/api/auth-session";
import { clearPending, mfaError, mfaRequest, pendingToken } from "@/server/api/mfa";

const verifySchema = z.object({ factor_id: z.string().min(1).max(256), code: z.string().regex(/^\d{6}$/) });
const sessionSchema = z.object({ access_token: z.string().min(1), expires_in: z.number().positive(), mfa_required: z.literal(false), user: z.object({ id: z.string(), email: z.string(), role: z.string() }) });

export async function POST(request: NextRequest) {
  const token = pendingToken(request);
  if (!token) return NextResponse.json({ message: "Your sign-in expired. Please sign in again." }, { status: 401 });
  const remember = request.cookies.get("mfa_remember")?.value === "1";
  const input = verifySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ message: "Enter a valid six-digit code." }, { status: 400 });
  const upstream = await mfaRequest("/auth/mfa/verify", token, input.data);
  if (!upstream?.ok) return mfaError(upstream);
  const session = sessionSchema.safeParse(await upstream.json().catch(() => null));
  if (!session.success) return NextResponse.json({ message: "Invalid verification response." }, { status: 502 });

  return clearPending(createSessionResponse(session.data.access_token, remember ? session.data.expires_in : undefined, session.data.user));
}

