import { getApiErrorMessage, proxyFormDataToApi } from "@lexchain/api";
import { getApiBaseUrl } from "@lexchain/config";

type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

const apiBaseUrl = getApiBaseUrl(process.env);

export async function POST(request: Request) {
  if (!apiBaseUrl) {
    return Response.json(
      { message: "Missing API_URL or NEXT_PUBLIC_API_URL." },
      { status: 500 },
    );
  }

  let response: Response;

  try {
    response = await proxyFormDataToApi(apiBaseUrl, "/public/verify", await request.formData());
  } catch {
    return Response.json(
      { message: "Unable to reach the verification API." },
      { status: 502 },
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  if (!response.ok) {
    return Response.json(
      {
        message: getApiErrorMessage(
          payload,
          `Verification failed with status ${response.status}.`,
        ),
      },
      { status: response.status },
    );
  }

  return Response.json(payload);
}
