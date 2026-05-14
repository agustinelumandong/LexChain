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

function formatStatusLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getDisplayName(user: {
  f_name?: string | null;
  l_name?: string | null;
  email?: string | null;
  user_id: string;
}) {
  const name = [user.f_name, user.l_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || user.email || `User ${formatReference(user.user_id)}`;
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
      const roleLabel = formatStatusLabel(party.role);

      return {
        id: party.user_id,
        name: getDisplayName(party),
        email: party.email,
        accessLabel: `${roleLabel || 'Viewer'} access`,
        actionLabel: roleLabel || 'View',
      };
    }),
    searchResults,
  };
}
