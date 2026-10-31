import { parsePortalApiError } from './portal-error';

let unauthorizedRecovery: Promise<void> | undefined;

function recoverUnauthorizedSession(): Promise<void> {
  if (!unauthorizedRecovery) {
    unauthorizedRecovery = fetch('/api/portal/logout', { method: 'POST', credentials: 'same-origin' })
      .catch(() => undefined)
      .then(() => { window.location.replace('/login'); });
  }
  return unauthorizedRecovery;
}

export async function portalRequest(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, { credentials: 'same-origin', ...init });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    const error = parsePortalApiError(body, response.status);
    if (response.status === 401 && typeof window !== 'undefined') await recoverUnauthorizedSession();
    throw error;
  }
  return response;
}

export async function portalFetch<T>(path: string): Promise<T> {
  const response = await portalRequest(`/api/portal/proxy?path=${encodeURIComponent(path)}`, {
    cache: 'no-store',
  });
  return response.json();
}
