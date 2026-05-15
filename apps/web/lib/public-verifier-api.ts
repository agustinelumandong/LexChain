export type PublicVerifyResponse = {
  status: string;
  confidence: number;
  file_name?: string | null;
  storage_url?: string | null;
  recorded_at?: number | null;
  recorded_by?: string | null;
  tx_hash?: string | null;
  matched_at: string;
};

type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

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

export async function verifyPublicPdf(file: File): Promise<PublicVerifyResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch("/api/public/verify", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Unable to reach the verification API. Check API_URL and try again.");
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, `Verification failed with status ${response.status}.`),
    );
  }

  return payload as PublicVerifyResponse;
}
