import { getPortalUiRole } from '@/features/access/portal-role';

export function canLoadDocumentActivity(role?: string): boolean {
  return getPortalUiRole(role) === 'lawyer';
}
