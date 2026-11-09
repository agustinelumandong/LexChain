import { NextResponse, type NextRequest } from "next/server";
import { clearPending, mfaRequest, pendingToken } from "@/server/api/mfa";

export async function POST(request: NextRequest) {
  const token = pendingToken(request);
  if (token) await mfaRequest("/auth/signout", token);
  return clearPending(NextResponse.json({ ok: true }));
}
