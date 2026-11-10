'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import { Badge, Button, Card, type BadgeVariant } from '@/shared/components/ui';
import type { components } from '@/shared/types/index';
import { formatRelativeExpiry } from '@/features/access/participant-access';

type DocumentParty = components['schemas']['DocumentPartyResponse'];

type ParticipantAccessTableProps = {
  parties: DocumentParty[];
  canRevoke: boolean;
  canInvite?: boolean;
  onRevoke: (party: DocumentParty) => Promise<void>;
  onResend?: (party: DocumentParty) => Promise<void>;
};

function getStatusBadgeVariant(status?: string): BadgeVariant {
  if (status === 'accepted') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'declined' || status === 'expired') return 'danger';
  return 'default';
}

function ParticipantIdentity({ party }: { party: DocumentParty }) {
  const fullName = [party.f_name, party.l_name].filter(Boolean).join(' ');
  const hasAccountName = Boolean(party.user_id && fullName);
  return (
    <div className="min-w-0 @3xl:flex-1">
      <p title={hasAccountName ? fullName : party.email} className="truncate font-bold text-[var(--text-primary)]">{hasAccountName ? fullName : party.email}</p>
      <p title={hasAccountName ? party.email : undefined} className="truncate text-xs text-[var(--text-secondary)]">{hasAccountName ? party.email : 'Invited email'}</p>
    </div>
  );
}

function ParticipantStatus({ party }: { party: DocumentParty }) {
  if (party.user_id !== null) {
    return <Badge dot variant={getStatusBadgeVariant(party.status)} className="capitalize">{party.status}</Badge>;
  }
  if (party.status === 'expired') {
    return <Badge dot variant="danger">Invitation expired</Badge>;
  }
  const relativeExpiry = formatRelativeExpiry(party.expires_at);
  return (
    <div className="flex flex-col gap-1">
      <Badge dot variant="info" className="w-fit">Waiting for sign-up</Badge>
      {relativeExpiry && <span className="text-xs text-[var(--text-secondary)]">expires {relativeExpiry}</span>}
    </div>
  );
}

export function ParticipantAccessTable({ parties, canRevoke, canInvite = false, onRevoke, onResend }: ParticipantAccessTableProps) {
  const [partyToRevoke, setPartyToRevoke] = useState<DocumentParty>();
  const [resendingPartyId, setResendingPartyId] = useState<string>();
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string>();

  async function handleResend(party: DocumentParty) {
    if (!onResend) return;
    setError(undefined);
    setResendingPartyId(party.id);
    try {
      await onResend(party);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to resend invitation.');
    } finally {
      setResendingPartyId(undefined);
    }
  }

  async function confirmRevoke() {
    if (!partyToRevoke) return;
    setError(undefined);
    setIsRevoking(true);
    try {
      await onRevoke(partyToRevoke);
      setPartyToRevoke(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to revoke document access.');
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <Card padded={false}>
      <div className="border-b border-[var(--border-soft)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Document participants</h2>
      </div>
      {parties.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">No participants have access yet.</p>
          {canInvite && <p className="mt-1 text-sm text-[var(--text-secondary)]">Invite someone above to share this document.</p>}
        </div>
      ) : (
        <ul aria-label="Document participants" className="@container divide-y divide-[var(--border-soft)]">
          {parties.map((party) => {
            const isEmailInvite = party.user_id === null;
            return (
              <li key={party.id} className="flex flex-col gap-3 px-5 py-4 @3xl:flex-row @3xl:items-center @3xl:gap-4">
                <ParticipantIdentity party={party} />
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 @3xl:w-64 @3xl:shrink-0">
                  <div>
                    <dt className="text-xs font-semibold text-[var(--text-secondary)]">Permission</dt>
                    <dd className="mt-1 text-sm capitalize text-[var(--text-primary)]">{party.role}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-[var(--text-secondary)]">Status</dt>
                    <dd className="mt-1"><ParticipantStatus party={party} /></dd>
                  </div>
                </dl>
                {canRevoke && (
                  <div className="flex flex-wrap gap-2 @3xl:w-60 @3xl:shrink-0 @3xl:justify-end">
                    {isEmailInvite && onResend && (
                      <Button
                        type="button"
                        size="sm"
                        variant={party.status === 'expired' ? 'primary' : 'secondary'}
                        disabled={resendingPartyId === party.id}
                        aria-label={`Resend invitation to ${party.email}`}
                        onClick={() => void handleResend(party)}
                      >
                        <ForwardToInboxOutlinedIcon aria-hidden="true" fontSize="small" />
                        {resendingPartyId === party.id ? 'Resending…' : 'Resend'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="danger-outline"
                      aria-label={isEmailInvite ? `Remove invitation for ${party.email}` : `Revoke access for ${party.email}`}
                      onClick={() => { setError(undefined); setPartyToRevoke(party); }}
                    >
                      {isEmailInvite
                        ? <DeleteOutlinedIcon aria-hidden="true" fontSize="small" />
                        : <PersonRemoveOutlinedIcon aria-hidden="true" fontSize="small" />}
                      {isEmailInvite ? 'Remove' : 'Revoke'}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {partyToRevoke && (
        <Dialog
          open
          onClose={() => !isRevoking && setPartyToRevoke(undefined)}
          aria-labelledby="participant-revocation-title"
          aria-describedby="participant-revocation-description"
        >
          <DialogTitle id="participant-revocation-title">
            {partyToRevoke.user_id === null
              ? `Remove invitation for ${partyToRevoke.email}?`
              : `Revoke access for ${partyToRevoke.email}?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="participant-revocation-description">
              {partyToRevoke.user_id === null
                ? 'The sign-up link will no longer add them to this document.'
                : 'They will no longer be able to open this document. Historical activity remains recorded.'}
            </DialogContentText>
            {error && <p role="alert" className="mt-3 rounded-lg bg-[var(--status-error-bg)] p-3 text-sm font-semibold text-[var(--status-error)]">{error}</p>}
          </DialogContent>
          <DialogActions>
            <Button type="button" size="sm" variant="secondary" onClick={() => setPartyToRevoke(undefined)} disabled={isRevoking}>
              Cancel
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => void confirmRevoke()} disabled={isRevoking}>
              {isRevoking ? 'Removing…' : partyToRevoke.user_id === null ? 'Remove invitation' : 'Revoke access'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
}
