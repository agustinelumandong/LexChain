import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { mfaError, mfaRequest, pendingToken } from "@/server/api/mfa";

const enrollmentSchema = z.object({ factor_id: z.string().min(1), qr_code: z.string().startsWith("data:image/svg+xml"), secret: z.string().min(1) });

export async function POST(request: NextRequest) {
  const token = pendingToken(request);
  if (!token) return NextResponse.json({ message: "Your sign-in expired. Please sign in again." }, { status: 401 });
  const upstream = await mfaRequest("/auth/mfa/enroll", token);
  if (!upstream?.ok) return mfaError(upstream);
  const enrollment = enrollmentSchema.safeParse(await upstream.json().catch(() => null));
  if (!enrollment.success) return NextResponse.json({ message: "Invalid enrollment response." }, { status: 502 });
  return NextResponse.json(enrollment.data, { headers: { "Cache-Control": "no-store" } });
}
