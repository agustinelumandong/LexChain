'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  finalizeDemoDocument,
  restoreDemoSnapshot,
} from '../../lib/document-lifecycle-api';
import {
  canFinalizeDocument,
  canRestoreDocument,
  type DemoDocumentLifecycle,
  type DemoDocumentSnapshot,
} from '../../lib/document-lifecycle-ui';
import {
  getDemoIntegrityState,
  shortenIntegrityHash,
  type IntegrityUiState,
} from '../../lib/integrity-ui';
import type { PortalUiRole } from '../../lib/portal-role';

type WorkspaceDocument = Partial<DemoDocumentLifecycle> & {
  document_id: string;
  file_name?: string | null;
  document_number?: number | string | null;
  content_type?: string | null;
  status?: string | null;
  storage_url?: string | null;
  summary?: string | null;
  labels?: unknown[] | null;
  entities?: unknown[] | null;
  risk_flags?: unknown[] | null;
};

type BlockchainRecord = {
  data_hash?: string | null;
  tx_hash?: string | null;
  onchain_timestamp?: number | null;
} | null | undefined;

const tabs = ['Overview', 'Original PDF', 'Insights', 'Blockchain', 'Versions', 'Access', 'Activity'] as const;
type Tab = typeof tabs[number];

function readable(value: unknown): string {
  if (value == null) return 'Not supplied';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const [key, entryValue] = entries[0];
      return `${key} — ${readable(entryValue)}`;
    }
  }
  return JSON.stringify(value);
}

function integrityLabel(state: IntegrityUiState) {
  if (state === 'recorded') return 'Integrity record available';
  if (state === 'unavailable') return 'Integrity status unavailable';
  if (state === 'mismatch') return 'Integrity mismatch';
  if (state === 'match') return 'Integrity match';
  return 'No integrity record';
}

function lifecycleLabel(value: DemoDocumentLifecycle['lifecycle'] | undefined) {
  if (!value) return 'Not available';
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function anchorLabel(value: DemoDocumentLifecycle['anchor_status'] | undefined) {
  if (!value) return 'Not available';
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not available';
}

function InsightGroup({ title, items }: { title: string; items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => <li key={index} className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-sm text-[#0C2B49]">{readable(item)}</li>)}
      </ul>
    </section>
  );
}

type DocumentWorkspaceProps = {
  document: WorkspaceDocument;
  role: PortalUiRole;
  chain?: BlockchainRecord;
  integrityState: IntegrityUiState;
  snapshots?: DemoDocumentSnapshot[];
  snapshotsLoading?: boolean;
  snapshotsError?: boolean;
  onRetry?: () => void;
  onRetrySnapshots?: () => void;
};

const demoDisclaimer = 'Demo only — no production document or blockchain record was changed.';
const finalizationConfirmation = 'Demo finalization will generate a mock hash, create a text snapshot, and simulate anchoring. No production document or blockchain record is changed.';

export function DocumentWorkspace({
  document,
  role,
  chain,
  integrityState,
  snapshots,
  snapshotsLoading = false,
  snapshotsError = false,
  onRetry,
  onRetrySnapshots,
}: DocumentWorkspaceProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [lifecycleResult, setLifecycleResult] = useState<DemoDocumentLifecycle>();
  const [confirmingFinalize, setConfirmingFinalize] = useState(false);
  const [snapshotToRestore, setSnapshotToRestore] = useState<DemoDocumentSnapshot>();
  const [restorationReason, setRestorationReason] = useState('');
  const [success, setSuccess] = useState<string>();
  const hasInsights = Boolean(document.summary || document.labels?.length || document.entities?.length || document.risk_flags?.length);
  const lifecycle = lifecycleResult ?? document;
  const currentSnapshots = lifecycleResult?.snapshots ?? snapshots ?? document.snapshots ?? [];
  const canFinalize = role !== 'unsupported' && lifecycle.lifecycle !== undefined
    && canFinalizeDocument(role, document.status, lifecycle.lifecycle);
  const canRestore = role !== 'unsupported' && !success && canRestoreDocument(
    role,
    getDemoIntegrityState(integrityState),
    currentSnapshots,
  );

  async function refreshLifecycleQueries() {
    await Promise.all([
      ['portal-doc', document.document_id],
      ['portal-doc-chain', document.document_id],
      ['portal-doc-snapshots', document.document_id],
      ['portal-doc-audit', document.document_id],
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  }

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeDemoDocument(document.document_id),
    onSuccess: async (result) => {
      setLifecycleResult(result);
      setConfirmingFinalize(false);
      setSuccess('Demo document finalized.');
      await refreshLifecycleQueries();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ snapshotId, reason }: { snapshotId: string; reason: string }) =>
      restoreDemoSnapshot(document.document_id, snapshotId, reason),
    onSuccess: async (result) => {
      setLifecycleResult(result);
      setSnapshotToRestore(undefined);
      setRestorationReason('');
      setSuccess('Extracted text was restored from the selected snapshot. The original PDF was not changed.');
      await refreshLifecycleQueries();
    },
  });

  function openFinalizeConfirmation() {
    finalizeMutation.reset();
    setSuccess(undefined);
    setConfirmingFinalize(true);
  }

  function openRestoreConfirmation(snapshot: DemoDocumentSnapshot) {
    restoreMutation.reset();
    setSuccess(undefined);
    setRestorationReason('');
    setSnapshotToRestore(snapshot);
  }

  const finalizeError = finalizeMutation.error instanceof Error ? finalizeMutation.error.message : null;
  const restoreError = restoreMutation.error instanceof Error ? restoreMutation.error.message : null;

  return (
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <div role="tablist" aria-label="Document workspace" className="flex overflow-x-auto border-b border-[#E8F0F8] px-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-extrabold ${activeTab === tab ? 'border-[#0985E7] text-[#0985E7]' : 'border-transparent text-[#64748b]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Overview</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-[#64748b]">Filename</dt><dd className="mt-1 text-[#0C2B49]">{document.file_name ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Reference</dt><dd className="mt-1 text-[#0C2B49]">{document.document_number ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Content type</dt><dd className="mt-1 text-[#0C2B49]">{document.content_type ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Lifecycle status</dt><dd className="mt-1 text-[#0C2B49]">{document.status ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Integrity status</dt><dd className="mt-1 text-[#0C2B49]">{integrityLabel(integrityState)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Demo lifecycle</dt><dd className="mt-1 text-[#0C2B49]">{lifecycleLabel(lifecycle.lifecycle)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Document hash</dt><dd title={lifecycle.document_hash ?? undefined} className="mt-1 font-mono text-[#0C2B49]">{lifecycle.document_hash ? shortenIntegrityHash(lifecycle.document_hash) : 'Not available'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Text snapshots</dt><dd className="mt-1 text-[#0C2B49]">{currentSnapshots.length}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Finalized</dt><dd className="mt-1 text-[#0C2B49]">{formatDate(lifecycle.finalized_at)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Anchor state</dt><dd className="mt-1 text-[#0C2B49]">{anchorLabel(lifecycle.anchor_status)}</dd></div>
            </dl>
            {canFinalize && <button type="button" onClick={openFinalizeConfirmation} className="w-fit rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Finalize</button>}
            {success && <p role="status" className="rounded-xl border border-[#BCE8CC] bg-[#F1FBF5] px-4 py-3 text-sm font-bold text-[#0C7A3B]">{success}</p>}
            <p className="text-xs leading-5 text-[#64748b]">{demoDisclaimer}</p>
            {integrityState === 'unavailable' && onRetry && <button type="button" onClick={onRetry} className="w-fit rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0985E7]">Retry integrity lookup</button>}
            <p className="text-sm leading-6 text-[#64748b]">Use this workspace to review the original file, derived assistance, and available integrity information.</p>
            {confirmingFinalize && (
              <div role="dialog" aria-modal="true" aria-label="Confirm demo finalization" className="rounded-xl border border-[#CFE7FC] bg-[#F1F8FF] p-4">
                <p className="font-bold text-[#0C2B49]">Finalize this demo document?</p>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">{finalizationConfirmation}</p>
                {finalizeError && <p role="alert" className="mt-3 text-sm font-bold text-[#B42318]">{finalizeError}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setConfirmingFinalize(false)} disabled={finalizeMutation.isPending} className="rounded-lg border border-[#D6E3F1] px-3 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Cancel</button>
                  <button type="button" onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending} className="rounded-lg bg-[#0985E7] px-3 py-2 text-sm font-bold text-white disabled:opacity-60">{finalizeMutation.isPending ? 'Finalizing…' : 'Confirm finalization'}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Original PDF' && (document.storage_url ? (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Original PDF</h2>
            <p className="text-sm leading-6 text-[#64748b]">This is the source document and is available for viewing or download only. It cannot be edited in LexChain.</p>
            <div className="flex flex-wrap gap-3">
              <a href={document.storage_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Open original PDF</a>
              <a href={document.storage_url} download className="rounded-full border border-[#E8F0F8] px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Download original PDF</a>
            </div>
          </div>
        ) : <p className="text-sm text-[#64748b]">The original PDF is not available in the current document record.</p>)}

        {activeTab === 'Insights' && (
          <div className="space-y-5">
            <div><h2 className="text-lg font-extrabold text-[#0C2B49]">Insights</h2><p className="mt-1 text-sm leading-6 text-[#64748b]">AI-generated assistance only. Review it carefully; the original document remains authoritative.</p></div>
            {hasInsights ? <div className="space-y-5">
              {document.summary && <section><h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">Summary</h3><p className="mt-2 text-sm leading-6 text-[#0C2B49]">{document.summary}</p></section>}
              <InsightGroup title="Labels" items={document.labels} />
              <InsightGroup title="Entities" items={document.entities} />
              <InsightGroup title="Risk flags" items={document.risk_flags} />
            </div> : <p className="text-sm text-[#64748b]">No derived insights are available in the current document record.</p>}
          </div>
        )}

        {activeTab === 'Blockchain' && (integrityState === 'unavailable' ? (
          <div className="space-y-4"><p className="text-sm text-[#64748b]">Integrity status unavailable</p>{onRetry && <button type="button" onClick={onRetry} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0985E7]">Retry integrity lookup</button>}</div>
        ) : chain?.data_hash ? (
          <div className="space-y-4"><div><h2 className="text-lg font-extrabold text-[#0C2B49]">Blockchain</h2><p className={`mt-2 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${integrityState === 'mismatch' ? 'bg-[#FFF4DD] text-[#B77900]' : 'bg-[#EAF8F0] text-[#12A150]'}`}>{integrityLabel(integrityState)}</p><p className="mt-1 text-sm leading-6 text-[#64748b]">A hash record supports integrity checking, not legal validity.</p></div><dl className="space-y-3 text-sm"><div><dt className="font-bold text-[#64748b]">Data hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{chain.data_hash}</dd></div>{chain.tx_hash && <div><dt className="font-bold text-[#64748b]">Transaction hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{chain.tx_hash}</dd></div>}</dl></div>
        ) : <p className="text-sm text-[#64748b]">No blockchain record is available in the current document record.</p>)}

        {activeTab === 'Versions' && (
          <div className="space-y-4">
            <div><h2 className="text-lg font-extrabold text-[#0C2B49]">Versions</h2><p className="mt-1 text-sm text-[#64748b]">Text snapshots support this demo restoration flow. The original PDF remains unchanged.</p></div>
            {snapshotsLoading && <p className="text-sm text-[#64748b]">Loading text snapshots…</p>}
            {snapshotsError && <div><p className="text-sm font-bold text-[#B42318]">Unable to load text snapshots.</p>{onRetrySnapshots && <button type="button" onClick={onRetrySnapshots} className="mt-2 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0985E7]">Retry snapshots</button>}</div>}
            {!snapshotsLoading && !snapshotsError && currentSnapshots.length === 0 && <p className="text-sm text-[#64748b]">No text snapshots are available for this document.</p>}
            {!snapshotsLoading && !snapshotsError && currentSnapshots.map((snapshot) => (
              <article key={snapshot.id} className="rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#0C2B49]">{formatDate(snapshot.created_at)}</p>
                    <p title={snapshot.text_hash} className="mt-1 font-mono text-xs text-[#64748b]">{shortenIntegrityHash(snapshot.text_hash)}</p>
                  </div>
                  {canRestore && <button type="button" onClick={() => openRestoreConfirmation(snapshot)} className="rounded-full border border-[#F5D7A1] px-4 py-2 text-sm font-bold text-[#9A5D00]">Restore</button>}
                </div>
              </article>
            ))}
            {success && <p role="status" className="rounded-xl border border-[#BCE8CC] bg-[#F1FBF5] px-4 py-3 text-sm font-bold text-[#0C7A3B]">{success}</p>}
            {snapshotToRestore && (
              <div role="dialog" aria-modal="true" aria-label="Confirm text snapshot restoration" className="rounded-xl border border-[#F5D7A1] bg-[#FFF9EC] p-4">
                <p className="font-bold text-[#0C2B49]">Restore extracted text from this snapshot?</p>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">This restores the demo extracted text only. The original PDF is never replaced or edited.</p>
                <label className="mt-4 block text-sm font-bold text-[#0C2B49]">Restoration reason
                  <textarea required value={restorationReason} onChange={(event) => setRestorationReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-[#D7E4F2] bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0985E7]" />
                </label>
                {restoreError && <p role="alert" className="mt-3 text-sm font-bold text-[#B42318]">{restoreError}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSnapshotToRestore(undefined)} disabled={restoreMutation.isPending} className="rounded-lg border border-[#D6E3F1] px-3 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Cancel</button>
                  <button
                    type="button"
                    onClick={() => restoreMutation.mutate({ snapshotId: snapshotToRestore.id, reason: restorationReason })}
                    disabled={!restorationReason.trim() || restoreMutation.isPending}
                    className="rounded-lg bg-[#B45309] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {restoreMutation.isPending ? 'Restoring…' : 'Confirm restoration'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Access' && (
          <div className="space-y-3"><h2 className="text-lg font-extrabold text-[#0C2B49]">Access</h2><p className="text-sm text-[#64748b]">Manage access on the existing document participant surface.</p><Link href={`/portal/documents/${document.document_id}/participants`} className="inline-flex rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Manage document participants</Link></div>
        )}

        {activeTab === 'Activity' && (
          <div className="space-y-3"><h2 className="text-lg font-extrabold text-[#0C2B49]">Activity</h2><p className="text-sm text-[#64748b]">Review lifecycle and access events on the existing audit surface.</p><Link href={`/portal/documents/${document.document_id}/activity`} className="inline-flex rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">View document activity</Link></div>
        )}
      </div>
    </section>
  );
}
