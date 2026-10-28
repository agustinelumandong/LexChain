'use client';

import { useState } from 'react';
import { Button, Card, Table } from '@/shared/components/ui';
import type { components } from '@/shared/types/index';

type DocumentParty = components['schemas']['DocumentPartyResponse'];

type ParticipantAccessTableProps = {
  parties: DocumentParty[];
  canRevoke: boolean;
  onRevoke: (party: DocumentParty) => Promise<void>;
};

export function ParticipantAccessTable({ parties, canRevoke, onRevoke }: ParticipantAccessTableProps) {
  const [partyToRevoke, setPartyToRevoke] = useState<DocumentParty>();
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string>();

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
        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">Access is limited to this document.</p>
      </div>
      <Table
        ariaLabel="Document participants"
        columns={[
          {
            key: 'participant',
            label: 'Participant',
            render: (party) => (
              <>
                <p className="font-bold text-[var(--text-primary)]">{party.f_name} {party.l_name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{party.email}</p>
              </>
            ),
          },
          { key: 'permission', label: 'Permission', render: (party) => <span className="capitalize text-[var(--text-primary)]">{party.role}</span> },
          { key: 'status', label: 'Status', render: (party) => <span className="capitalize text-[var(--text-primary)]">{party.status}</span> },
          ...(canRevoke ? [{
            key: 'actions',
            label: 'Actions',
            render: (party: DocumentParty) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled
                  title="Resending document invitations is not supported by the current API."
                >
                  Resend unavailable
                </Button>
                <Button type="button" size="sm" variant="danger" onClick={() => setPartyToRevoke(party)}>
                  Revoke
                </Button>
              </div>
            ),
          }] : []),
        ]}
        data={parties}
        keyExtractor={(party) => party.id}
        emptyMessage="No participants have access yet."
      />
      {error && <p role="alert" className="px-5 pb-4 text-sm font-semibold text-[var(--status-error)]">{error}</p>}
      {partyToRevoke && (
        <div role="dialog" aria-modal="true" aria-label="Confirm participant revocation" className="border-t border-[var(--border-soft)] bg-[var(--status-error-bg)] px-5 py-4">
          <p className="font-bold text-[var(--text-primary)]">Revoke access for {partyToRevoke.email}?</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">They will no longer be able to open this document. Historical activity remains recorded.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setPartyToRevoke(undefined)} disabled={isRevoking}>
              Cancel
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => void confirmRevoke()} disabled={isRevoking}>
              {isRevoking ? 'Revoking…' : 'Revoke access'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
