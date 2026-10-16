'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiSchema, components } from '@/shared/types/index';
import { InviteParticipantForm, ParticipantAccessTable } from "@/features/access/components";
import { inviteDocumentParty, listDocumentParties, revokeDocumentParty, searchUserByEmail, isParticipantAccessCapabilityError } from "@/features/access";
import { portalFetch } from '@/shared/api/client';

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type DocumentParty = components['schemas']['DocumentPartyResponse'];

function CapabilityUnavailable({ message }: { message: string }) {
  return <section className="rounded-[18px] border border-[#F4D7A9] bg-[#FFFBF2] p-5"><h2 className="text-lg font-extrabold text-[#0C2B49]">Participant access is unavailable</h2><p className="mt-2 text-sm font-medium text-[#775C23]">{message}</p></section>;
}

function getUnavailableParticipantAccessMessage({
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

export default function DocumentParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const documentQuery = useQuery<DocumentResponse>({ queryKey: ['portal-doc', id], queryFn: () => portalFetch<DocumentResponse>(`/documents/${id}`), retry: false });
  const canShare = documentQuery.data?.permissions?.can_share === true;
  const canRevoke = documentQuery.data?.permissions?.can_revoke === true;
  const partiesQuery = useQuery({ queryKey: ['portal-document-parties', id], queryFn: () => listDocumentParties(id), enabled: canShare || canRevoke, retry: false });
  const [capabilityError, setCapabilityError] = useState(false);
  const unavailableMessage = getUnavailableParticipantAccessMessage({ documentError: documentQuery.isError, capabilityError, canShare, canRevoke });

  const refreshParties = () => queryClient.invalidateQueries({ queryKey: ['portal-document-parties', id] });
  const rejectUnavailableCapability = (reason: unknown) => {
    if (isParticipantAccessCapabilityError(reason)) setCapabilityError(true);
  };
  const inviteMutation = useMutation({ mutationFn: (invitation: { email: string; role: string }) => inviteDocumentParty(id, invitation), onSuccess: refreshParties, onError: rejectUnavailableCapability });
  const revokeMutation = useMutation({ mutationFn: (party: DocumentParty) => {
    if (!party.user_id) return Promise.reject(new Error('This participant cannot be revoked because no user identifier was returned.'));
    return revokeDocumentParty(id, party.user_id);
  }, onSuccess: refreshParties, onError: rejectUnavailableCapability });

  if (documentQuery.isPending) return <div role="status" aria-label="Loading participant permissions" className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <div><Link href={`/portal/documents/${id}`} className="flex w-fit items-center gap-1.5 text-sm font-bold text-[#0985E7]"><ArrowBackIcon sx={{ fontSize: 16 }} /> Back to document</Link><p className="mt-4 text-xs font-bold uppercase tracking-[0.5px] text-[#0985E7]">Document access</p><h1 className="mt-1 text-2xl font-extrabold text-[#0C2B49]">Participant management</h1><p className="mt-1 text-sm font-medium text-[#64748b]">Invite and revoke access for this document. This does not manage user roles, office access, or categories.</p></div>
      {unavailableMessage ? <CapabilityUnavailable message={unavailableMessage} /> : <>
        {canShare && <InviteParticipantForm onFindAccount={searchUserByEmail} onInvite={(invitation) => inviteMutation.mutateAsync(invitation).then(() => undefined)} />}
        {partiesQuery.isError ? <p role="alert" className="text-sm font-semibold text-[#B42318]">Unable to load document participants. Please try again.</p> : partiesQuery.isPending ? <p role="status" className="text-sm font-semibold text-[#64748b]">Loading document participants…</p> : <ParticipantAccessTable parties={partiesQuery.data?.parties ?? []} canRevoke={canRevoke} onRevoke={(party) => revokeMutation.mutateAsync(party).then(() => undefined)} />}
      </>}
    </div>
  );
}
