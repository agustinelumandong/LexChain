type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

const apiBaseUrl =
  (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.trim().replace(/\/$/, "") ?? "";

function buildBackendUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function getErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
  if (typeof payload?.message === "string") {
    return payload.message;
  }

  if (typeof payload?.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload?.detail) && payload.detail.length > 0) {
    return "The uploaded PDF could not be verified. Check the file and try again.";
  }

  return fallback;
}

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return Response.json(
      { message: "Missing API_URL or NEXT_PUBLIC_API_URL." },
      { status: 500 },
    );
  }

  let response: Response;

  try {
    response = await fetch(buildBackendUrl("/public/verify"), {
      method: "POST",
      body: await request.formData(),
    });
  } catch {
    return Response.json(
      { message: "Unable to reach the verification API." },
      { status: 502 },
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  if (!response.ok) {
    return Response.json(
      { message: getErrorMessage(payload, `Verification failed with status ${response.status}.`) },
      { status: response.status },
    );
  }

  return Response.json(payload);
}
