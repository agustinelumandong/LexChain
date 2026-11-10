const PORTAL_PATH_PREFIX = '/portal/';

export function getSafePortalReturnPath(path?: string | null): string | undefined {
  if (!path?.startsWith(PORTAL_PATH_PREFIX) || path.includes('\\')) return undefined;
  return path;
}

export function buildSessionExpiredLoginUrl(pathname: string, search: string): string {
  const returnPath = getSafePortalReturnPath(`${pathname}${search}`);
  return `/login?reason=session-expired${returnPath ? `&next=${encodeURIComponent(returnPath)}` : ''}`;
}
