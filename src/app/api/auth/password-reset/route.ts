import { z } from "zod";
import { signUpPasswordSchema } from "@/features/auth/schemas/auth";
import { backendUrl } from "@/server/api/backend";

const requestSchema = z.strictObject({ token_hash: z.string().min(1), new_password: signUpPasswordSchema });

export async function POST(request: Request) {
  if (!process.env.API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    return Response.json({ message: "Missing API_URL." }, { status: 500 });
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Check your reset details." }, { status: 422 });

  try {
    const upstream = await fetch(backendUrl("/auth/password-reset"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    return Response.json(
      { message: upstream.ok ? "Password updated." : "Could not reset your password." },
      { status: upstream.status },
    );
  } catch {
    return Response.json({ message: "Could not connect to LexChain. Please try again." }, { status: 502 });
  }
}
