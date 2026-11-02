'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { components } from '@/shared/types/index';
import { InviteParticipantForm, ParticipantAccessTable } from '@/features/access/components';
import {
  inviteDocumentParty,
  listDocumentParties,
  revokeDocumentParty,
  searchUserByEmail,
  isParticipantAccessCapabilityError,
} from '@/features/access';

type DocumentParty = components['schemas']['DocumentPartyResponse'];

export function CapabilityUnavailable({ message }: { message: string }) {
  return (
    <section className="rounded-[18px] border border-[#F4D7A9] bg-[#FFFBF2] p-5">
      <h2 className="text-lg font-extrabold text-[#0C2B49]">Participant access is unavailable</h2>
      <p className="mt-2 text-sm font-medium text-[#775C23]">{message}</p>
    </section>
  );
}

export function getUnavailableParticipantAccessMessage({
  documentError,
  capabilityError,
  canShare,
  canRevoke,
}: {
  documentError: boolean;
  capabilityError: boolean;
  canShare: boolean;
  canRevoke: boolean;
}): string | undefined {
  if (documentError) return 'Document permissions could not be verified, so participant access is unavailable.';
  if (capabilityError) return 'Your account can no longer manage participants for this document. No further access changes were made.';
  if (!canShare && !canRevoke) return 'Your account does not have sharing or revocation permission for this document.';
  return undefined;
}

export interface DocumentParticipantManagementProps {
  documentId: string;
  canShare?: boolean;
  canRevoke?: boolean;
  documentError?: boolean;
  onPartiesChanged?: () => void;
}

export function DocumentParticipantManagement({
  documentId,
  canShare = false,
  canRevoke = false,
  documentError = false,
  onPartiesChanged,
}: DocumentParticipantManagementProps) {
  const queryClient = useQueryClient();
  const [capabilityError, setCapabilityError] = useState(false);

  const partiesQuery = useQuery({
    queryKey: ['portal-document-parties', documentId],
    queryFn: () => listDocumentParties(documentId),
    enabled: canShare || canRevoke,
    retry: false,
    refetchInterval: 15_000,
  });

  const unavailableMessage = getUnavailableParticipantAccessMessage({
    documentError,
    capabilityError,
    canShare,
    canRevoke,
  });

  const refreshParties = async () => {
    await queryClient.invalidateQueries({ queryKey: ['portal-document-parties', documentId] });
    onPartiesChanged?.();
  };

  const rejectUnavailableCapability = (reason: unknown) => {
    if (isParticipantAccessCapabilityError(reason)) setCapabilityError(true);
  };

  const inviteMutation = useMutation({
    mutationFn: (invitation: { email: string; role: string }) =>
      inviteDocumentParty(documentId, invitation),
    onSuccess: () => {
      toast.success('Invitation sent.');
      return refreshParties();
    },
    onError: rejectUnavailableCapability,
  });

  const revokeMutation = useMutation({
    mutationFn: (party: DocumentParty) => {
      if (!party.user_id) {
        return Promise.reject(
          new Error('This participant cannot be revoked because no user identifier was returned.')
        );
      }
      return revokeDocumentParty(documentId, party.user_id);
    },
    onSuccess: () => {
      toast.success('Participant access revoked.');
      return refreshParties();
    },
    onError: rejectUnavailableCapability,
  });

  if (unavailableMessage) {
    return <CapabilityUnavailable message={unavailableMessage} />;
  }

  return (
    <div className="space-y-4">
      {canShare && (
        <InviteParticipantForm
          onFindAccount={searchUserByEmail}
          onInvite={(invitation) =>
            inviteMutation.mutateAsync(invitation).then(() => undefined)
          }
        />
      )}
      {partiesQuery.isError ? (
        <p role="alert" className="text-sm font-semibold text-[#B42318]">
          Unable to load document participants. Please try again.
        </p>
      ) : partiesQuery.isPending ? (
        <p role="status" className="text-sm font-semibold text-[#5B6F8A]">
          Loading document participants…
        </p>
      ) : (
        <ParticipantAccessTable
          parties={partiesQuery.data?.parties ?? []}
          canRevoke={canRevoke}
          onRevoke={(party) =>
            revokeMutation.mutateAsync(party).then(() => undefined)
          }
        />
      )}
    </div>
  );
}
