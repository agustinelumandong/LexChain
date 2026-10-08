import { z } from "zod";
import { adminFetch, getTokenFromRequest, missingApiUrl, missingToken } from "@/server/api/backend";

const statusSchema = z.object({ is_active: z.boolean() });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const token = getTokenFromRequest(request);
  if (!token) return missingToken();

  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Account status must be active or suspended." }, { status: 400 });
  }

  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return missingApiUrl();

  let upstream: Response;
  try {
    const { id } = await params;
    upstream = await adminFetch(`/admin/users/${encodeURIComponent(id)}/active`, token, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return Response.json({ message: "Unable to reach the API." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);
  return Response.json(payload, { status: upstream.status });
}
