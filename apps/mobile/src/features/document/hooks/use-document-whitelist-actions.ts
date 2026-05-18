import { useMemo } from 'react';
import { toast } from 'sonner-native';

import type { DocumentPartyRole } from '@/types';
import { parseApiError } from '@/shared/utils/api-error';

import {
  mapPartiesToWhitelistData,
  mapUserSearchToWhitelistResult,
} from '../services/whitelist-mappers';

type AddPartyMutation = {
  mutateAsync: (args: {
    documentId: string;
    payload: {
      email: string;
      role: DocumentPartyRole;
    };
  }) => Promise<unknown>;
};

type RemovePartyMutation = {
  mutateAsync: (args: {
    documentId: string;
    partyUserId: string;
  }) => Promise<unknown>;
};

export function useDocumentWhitelistActions({
  addPartyMutation,
  documentId,
  onSearchQueryReset,
  parties,
  removePartyMutation,
  userSearchData,
}: {
  addPartyMutation: AddPartyMutation;
  documentId: string;
  onSearchQueryReset: () => void;
  parties?: Parameters<typeof mapPartiesToWhitelistData>[0];
  removePartyMutation: RemovePartyMutation;
  userSearchData?: Parameters<typeof mapUserSearchToWhitelistResult>[0];
}) {
  const whitelistData = useMemo(
    () =>
      mapPartiesToWhitelistData(
        parties,
        mapUserSearchToWhitelistResult(userSearchData),
      ),
    [parties, userSearchData],
  );

  const handleAddWhitelistResult = async (
    resultId: string,
    role: DocumentPartyRole,
  ) => {
    if (!documentId) {
      return;
    }

    const result = whitelistData.searchResults.find(
      (entry) => entry.id === resultId,
    );

    if (!result) {
      return;
    }

    try {
      await addPartyMutation.mutateAsync({
        documentId,
        payload: {
          email: result.email,
          role,
        },
      });
      onSearchQueryReset();
      toast.success(`${result.name} added as ${role}`);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleRevokeWhitelistGrant = async (partyUserId: string) => {
    if (!documentId) {
      return;
    }

    try {
      await removePartyMutation.mutateAsync({ documentId, partyUserId });
      toast.success('User removed from document access');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return {
    handleAddWhitelistResult,
    handleRevokeWhitelistGrant,
    whitelistData,
  };
}
