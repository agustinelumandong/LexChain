import { getPortalUiRole } from './portal-role';

export function canLoadDocumentActivity(role?: string): boolean {
  return getPortalUiRole(role) === 'issuer';
}
