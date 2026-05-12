const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const useMockApi = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

export const env = Object.freeze({
  apiUrl,
  hasApiUrl: apiUrl.length > 0,
  useMockApi,
});

export function requireApiUrl() {
  if (!env.apiUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_URL. Add it to your local .env file.");
  }

  return env.apiUrl;
}
