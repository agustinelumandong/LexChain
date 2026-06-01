import type {
  DocumentPartyResponse,
  UserSearchResponse,
} from '@/services/api';
import type { ManageWhitelistData, WhitelistSearchResult } from '@/types';

function formatReference(value: string) {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

function getAssignedRole(value: string): 'participant' | 'owner' | 'lawyer' {
  const normalizedRole = value.toLowerCase();

  if (normalizedRole === 'owner' || normalizedRole === 'issuer') {
    return 'owner';
  }

  if (normalizedRole === 'signer' || normalizedRole === 'editor') {
    return 'lawyer';
  }

  return 'participant';
}

function getAssignedRoleLabel(value: 'participant' | 'owner' | 'lawyer') {
  if (value === 'owner') {
    return 'Owner';
  }

  if (value === 'lawyer') {
    return 'Lawyer';
  }

  return 'Witness/Participant';
}

function getDisplayName(user: {
  f_name?: string | null;
  l_name?: string | null;
  email?: string | null;
  user_id?: string | null;
  id?: string | null;
}) {
  const name = [user.f_name, user.l_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || user.email || `User ${formatReference(user.user_id ?? user.id ?? 'unknown')}`;
}

export function mapUserSearchToWhitelistResult(
  user?: UserSearchResponse,
): WhitelistSearchResult[] {
  if (!user) {
    return [];
  }

  return [
    {
      id: user.user_id,
      name: getDisplayName(user),
      email: user.email,
    },
  ];
}

export function mapPartiesToWhitelistData(
  parties: DocumentPartyResponse[] = [],
  searchResults: WhitelistSearchResult[] = [],
): ManageWhitelistData {
  return {
    grants: parties.map((party) => {
      const assignedAs = getAssignedRole(party.role);
      const roleLabel = getAssignedRoleLabel(assignedAs);

      return {
        id: party.user_id ?? party.id,
        name: getDisplayName(party),
        email: party.email,
        assignedAs,
        accessLabel: roleLabel,
        actionLabel: roleLabel || 'View',
      };
    }),
    searchResults,
  };
}
