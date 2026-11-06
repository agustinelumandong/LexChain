'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircleIcon from '@mui/icons-material/Circle';
import { Button, Card, Table } from '@/shared/components/ui';
import type { components } from '@/shared/types/index';
import { formatRelativeExpiry } from '@/features/access/participant-access';

type DocumentParty = components['schemas']['DocumentPartyResponse'];

type ParticipantAccessTableProps = {
  parties: DocumentParty[];
  canRevoke: boolean;
  onRevoke: (party: DocumentParty) => Promise<void>;
  onResend?: (party: DocumentParty) => Promise<void>;
};

export function ParticipantAccessTable({ parties, canRevoke, onRevoke, onResend }: ParticipantAccessTableProps) {
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
      <Table
        ariaLabel="Document participants"
        columns={[
          {
            key: 'participant',
            label: 'Participant',
            render: (party) => {
              const fullName = [party.f_name, party.l_name].filter(Boolean).join(' ');
              if (party.user_id && fullName) {
                return (
                  <>
                    <p className="font-bold text-[var(--text-primary)]">{fullName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{party.email}</p>
                  </>
                );
              }
              return (
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{party.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Invited email</p>
                </div>
              );
            },
          },
          { key: 'permission', label: 'Permission', render: (party) => <span className="capitalize text-[var(--text-primary)]">{party.role}</span> },
          {
            key: 'status',
            label: 'Status',
            render: (party) => {
              if (party.user_id === null) {
                if (party.status === 'expired') {
                  return (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-current/15 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                      <CircleIcon aria-hidden="true" sx={{ fontSize: 8 }} />
                      Invitation expired
                    </span>
                  );
                }
                const relativeExpiry = formatRelativeExpiry(party.expires_at);
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-current/15 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      <CircleIcon aria-hidden="true" sx={{ fontSize: 8 }} />
                      Waiting for sign-up
                    </span>
                    {relativeExpiry && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        expires {relativeExpiry}
                      </span>
                    )}
                  </div>
                );
              }
              return <span className="capitalize text-[var(--text-primary)]">{party.status}</span>;
            },
          },
          ...(canRevoke ? [{
            key: 'actions',
            label: 'Actions',
            render: (party: DocumentParty) => {
              const isEmailInvite = party.user_id === null;
              const isExpired = party.status === 'expired';
              return (
                <div className="flex flex-wrap justify-end gap-2">
                  {isEmailInvite && onResend && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isExpired ? 'primary' : 'secondary'}
                      disabled={resendingPartyId === party.id}
                      onClick={() => void handleResend(party)}
                    >
                      {resendingPartyId === party.id ? 'Resending…' : 'Resend'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => { setError(undefined); setPartyToRevoke(party); }}
                  >
                    {isEmailInvite ? 'Remove' : 'Revoke'}
                  </Button>
                </div>
              );
            },
          }] : []),
        ]}
        data={parties}
        keyExtractor={(party) => party.id}
        emptyMessage="No participants have access yet."
      />
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
