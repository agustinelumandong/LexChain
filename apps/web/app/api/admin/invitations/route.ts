import { adminFetch, getTokenFromRequest, missingApiUrl, missingToken } from "@/lib/admin-api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

export async function GET(request: Request) {
  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return missingApiUrl();

  const token = getTokenFromRequest(request);
  if (!token) return missingToken();

  let upstream: Response;
  try {
    upstream = await adminFetch("/admin/invitations", token);
  } catch {
    return Response.json({ message: "Unable to reach the API." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);
  return Response.json(payload, { status: upstream.status });
}

export async function POST(request: Request) {
  if (useMock) {
    return Response.json({ message: "Mock invitation accepted." }, { status: 201 });
  }

  const apiBase = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return missingApiUrl();

  const token = getTokenFromRequest(request);
  if (!token) return missingToken();

  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return Response.json({ message: "Email is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await adminFetch("/admin/invitations", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return Response.json({ message: "Unable to reach the API." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);
  return Response.json(payload, { status: upstream.status });
}
