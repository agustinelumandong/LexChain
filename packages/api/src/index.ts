import { buildApiUrl } from "@lexchain/config";
import type { PublicVerifyResponse } from "@lexchain/types";

type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

export type { PublicVerifyResponse } from "@lexchain/types";

export function getApiErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
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

export async function verifyPublicPdf(file: File, endpoint = "/api/public/verify") {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Unable to reach the verification API. Check API_URL and try again.");
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(payload, `Verification failed with status ${response.status}.`),
    );
  }

  return payload as PublicVerifyResponse;
}

export async function proxyFormDataToApi(
  apiBaseUrl: string,
  path: string,
  formData: FormData,
) {
  return fetch(buildApiUrl(apiBaseUrl, path), {
    method: "POST",
    body: formData,
  });
}
