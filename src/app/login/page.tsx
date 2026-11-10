import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPortalLoginRedirect } from "@/features/access/portal-role";
import { LoginPage } from "@/features/auth/pages";
import { isMockMode } from "@/lib/mocks/mode";
import { isMockDocumentIssuerToken, isMockPortalToken } from "@/lib/mocks/portal";
import { backendUrl } from "@/server/api/backend";
import { getSafePortalReturnPath } from "@/shared/utils/login-return";

export default async function LoginRoute({ searchParams }: { searchParams?: Promise<{ reason?: string | string[]; next?: string | string[] }> } = {}) {
  const params = await searchParams;
  const token = (await cookies()).get("portal_token")?.value;
  let role: string | undefined;

  if (token && isMockMode() && isMockPortalToken(token)) {
    role = isMockDocumentIssuerToken(token) ? "lawyer" : "user";
  } else if (token && !isMockMode() && (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)) {
    const response = await fetch(backendUrl("/users/"), {
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    if (response?.ok) {
      const profile: unknown = await response.json().catch(() => null);
      if (typeof profile === "object" && profile !== null && "role" in profile && typeof profile.role === "string") {
        role = profile.role;
      }
    }
  }

  const destination = getPortalLoginRedirect(role);
  if (destination) redirect(destination);
  return <LoginPage sessionExpired={params?.reason === "session-expired"} returnPath={typeof params?.next === "string" ? getSafePortalReturnPath(params.next) : undefined} />;
}
