import type {
  DocumentPartyResponse,
  UserSearchResponse,
} from '@/services/api';
import type { ManageWhitelistData, WhitelistSearchResult, WhitelistGrantRole } from '@/types';

function formatReference(value: string) {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

function getAssignedRole(value: string): string {
  return value ? value.trim().toLowerCase() : 'owner';
}

function formatPartyRoleLabel(value: string) {
  const normalizedRole = value.trim().toLowerCase();

  if (normalizedRole === 'issuer') {
    return 'Owner';
  }

  if (!normalizedRole) {
    return 'Viewer';
  }

  return normalizedRole.replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      const roleLabel = formatPartyRoleLabel(party.role);

      return {
        id: party.id,
        name: getDisplayName(party),
        email: party.email,
        status: party.status as WhitelistGrantRole,
        assignedAs,
        accessLabel: roleLabel,
        actionLabel: `Assign as ${roleLabel}`,
      };
    }),
    searchResults,
  };
}
