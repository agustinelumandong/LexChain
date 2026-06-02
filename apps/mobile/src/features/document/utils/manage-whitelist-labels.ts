import type { DocumentPartyRole } from '@/types';
import { MOBILE_USER_ROLES, type MobileUserRoleKey } from '../constants/manage-whitelist.constants';

export function getWhitelistAddLabel(role: DocumentPartyRole) {
  return `Add ${role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}`;
}

export function getMobileRoleLabel(role: MobileUserRoleKey) {
  const predefined = MOBILE_USER_ROLES.find((r) => r.key === role);
  if (predefined) {
    return predefined.label;
  }

  return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
}
