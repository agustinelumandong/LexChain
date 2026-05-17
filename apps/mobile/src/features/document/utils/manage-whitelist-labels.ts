import type { DocumentPartyRole } from '@/types';

import type { MobileUserRoleKey } from '../constants/manage-whitelist.constants';

export function getWhitelistAddLabel(role: DocumentPartyRole) {
  if (role === 'viewer') {
    return 'Add Read';
  }

  return `Add ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

export function getMobileRoleLabel(role: MobileUserRoleKey) {
  if (role === 'owner') {
    return 'Owner';
  }

  if (role === 'lawyer') {
    return 'Lawyer';
  }

  return 'Witness/Participant';
}
