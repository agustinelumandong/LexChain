import { z } from "zod";
import { authEmailSchema } from "@/features/auth/schemas/auth";
import { backendUrl } from "@/server/api/backend";

const requestSchema = z.strictObject({ email: authEmailSchema });
const message = "If an account exists for that email, a reset link has been sent.";

export async function POST(request: Request) {
  if (!process.env.API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    return Response.json({ message: "Missing API_URL." }, { status: 500 });
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Enter a valid email address." }, { status: 422 });

  try {
    const upstream = await fetch(backendUrl("/auth/password-recovery"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    if (!upstream.ok) return Response.json({ message: "Could not request a reset link." }, { status: upstream.status });
    return Response.json({ message }, { status: upstream.status });
  } catch {
    return Response.json({ message: "Unable to reach the API." }, { status: 502 });
  }
}
