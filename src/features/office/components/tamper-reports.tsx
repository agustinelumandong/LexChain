'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Modal } from '@/features/admin/components/modal';
import { portalFetch, portalRequest } from '@/shared/api/client';
import { googleDraftReturnPath } from '@/shared/utils/google-draft-return-context';
import type { ApiSchema } from '@/shared/types';
import { EmptyState } from '@/shared/components/ui';
import { recordFieldLabel } from '@/shared/utils/record-field-label';
import { TamperRestoreResults, documentLabel, pdfAvailability, type RestoreSummary } from './tamper-restore-results';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';

type Reports = ApiSchema<'TamperReportListResponse'>;
type RestoreResult = ApiSchema<'RestoreAllResponse'>;
type RecoverResult = ApiSchema<'RecoverResponse'>;
type ReportItem = ApiSchema<'TamperReportItem'>;

const BLOCKED_MESSAGES: Record<NonNullable<ReportItem['blocked_reason']>, string> = {
  archive_missing: 'Cannot be restored: the original copy is missing.',
  metadata_unreadable: 'Cannot be restored: the saved record could not be read.',
  analysis_unreadable: 'Analysis could not be checked, so restoration is unavailable.',
  check_unavailable: 'Cannot be restored right now: the check could not be completed.',
  backup_needed: 'This document needs manual recovery.',
};

function reportStatusMessage(report: ReportItem) {
  if (report.restorable) return report.status === 'DELETED' ? 'Deleted document can be recovered.' : 'Available to restore';
  return (report.blocked_reason && BLOCKED_MESSAGES[report.blocked_reason]) || 'Cannot be restored right now.';
}

function changedFields(changes: NonNullable<ReportItem['changes']>) {
  return [...new Set(changes.map((change) => recordFieldLabel(change.field)))].join(', ');
}

function recoveryMessage(item: RecoverResult) {
  return `${documentLabel(item.file_name)}: Document recovered. ${pdfAvailability(item.file_present)}`;
}

export function TamperReports({ generateRequest = 0, actionTarget }: { generateRequest?: number; actionTarget?: HTMLElement | null }) {
  const [reports, setReports] = useState<Reports | null>(null);
  const [result, setResult] = useState<RestoreSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedRecovery, setSelectedRecovery] = useState<ReportItem | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<RecoverResult | null>(null);
  const lock = useRef(false);
  const lastGenerateRequest = useRef(0);
  const latestRequest = useRef(0);

  const loadReports = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const response = await portalFetch<Reports>('/documents/tamper-reports');
      if (!Array.isArray(response.reports)) throw new Error('Invalid report response.');
      if (request !== latestRequest.current) return;
      setReports(response);
    } catch (caught) {
      if (request !== latestRequest.current) return;
      setReports(null);
      setError(caught instanceof Error ? caught.message : 'Could not load reports.');
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (generateRequest === lastGenerateRequest.current) return;
    lastGenerateRequest.current = generateRequest;
    void loadReports();
  }, [generateRequest, loadReports]);

  async function restoreAll() {
    if (lock.current) return;
    lock.current = true;
    setRestoring(true);
    setResult(null);
    try {
      const response = await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent('/documents/tamper-reports/restore-all')}`, { method: 'POST' });
      const outcome: RestoreResult = await response.json();
      if (!Array.isArray(outcome.restored) || !Array.isArray(outcome.failed) || (outcome.recovered !== undefined && !Array.isArray(outcome.recovered))) throw new Error('Invalid restore response.');
      setResult({ outcome, fileNames: new Map(reports?.reports?.flatMap((report) => report.file_name ? [[report.document_id, report.file_name] as const] : [])) });
      setRecoveryResult(null);
      setConfirming(false);
      await loadReports();
    } catch {
      setConfirming(false);
      await loadReports();
      setError('The restore result could not be confirmed. Some documents may have changed; check the reports before trying again.');
    } finally {
      lock.current = false;
      setRestoring(false);
    }
  }

  async function recoverDocument() {
    if (lock.current || !selectedRecovery) return;
    const documentId = selectedRecovery.document_id;
    if (!googleDraftReturnPath(documentId)) return;
    lock.current = true;
    setRestoring(true);
    setError('');
    try {
      const response = await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(`/documents/tamper-reports/${documentId}/recover`)}`, { method: 'POST' });
      const outcome: RecoverResult = await response.json();
      if (outcome.document_id !== documentId || ![true, false, null].includes(outcome.file_present)) throw new Error('Invalid recovery response.');
      setRecoveryResult({ ...outcome, file_name: outcome.file_name || selectedRecovery.file_name });
      setResult(null);
      setSelectedRecovery(null);
      await loadReports();
    } catch (caught) {
      setSelectedRecovery(null);
      await loadReports();
      setError(`${caught instanceof Error ? caught.message : 'Recovery could not be confirmed.'} Check the reports before trying again; the document may already have been recovered.`);
    } finally {
      lock.current = false;
      setRestoring(false);
    }
  }

  const restoreButton = !loading && !!reports?.reports?.length && <button type="button" disabled={restoring} onClick={() => setConfirming(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#005F9E] disabled:opacity-60"><RestoreIcon fontSize="small" aria-hidden="true" />Restore all</button>;

  return <section aria-label="Open integrity reports" className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35">
    {actionTarget ? createPortal(restoreButton, actionTarget) : restoreButton}
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4EEF9] bg-[#FBFDFF] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0067B3]"><AssessmentOutlinedIcon fontSize="small" aria-hidden="true" /></span>
        <div><h2 className="text-xl font-black text-[#071B33]">Open integrity reports</h2><p className="mt-1 text-sm font-semibold text-[#5B6F8A]">Check unresolved problems in documents you own.</p></div>
      </div>
      <button type="button" disabled={loading || restoring} onClick={() => void loadReports()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#B9D6ED] bg-white px-4 py-2.5 text-sm font-black text-[#0067B3] transition hover:border-[#0067B3] hover:bg-[#F0F7FF] disabled:opacity-60"><RefreshIcon fontSize="small" aria-hidden="true" />{loading ? 'Checking…' : reports ? 'Refresh reports' : 'Check reports'}</button>
    </div>
    {loading && <div role="status" className="m-5 flex min-h-32 items-center justify-center gap-3 rounded-xl bg-[#F6FAFE] p-5 text-sm text-[#0C2B49] sm:m-6">
      <span aria-hidden="true" className="size-6 shrink-0 rounded-full border-2 border-[#B9D6ED] border-t-[#0067B3] motion-safe:animate-spin" />
      <div><p className="font-bold">Checking integrity reports…</p><p className="mt-1 text-[#5B6F8A]">Looking for unresolved problems in your documents.</p></div>
    </div>}
    {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 sm:mx-6">{error}</p>}
    {recoveryResult && <p role="status" className="mx-5 mt-5 text-sm font-bold text-[#0C2B49] sm:mx-6">{recoveryMessage(recoveryResult)}</p>}
    {result && <TamperRestoreResults summary={result} onDismiss={() => setResult(null)} />}
    {!loading && reports && <div className="space-y-3 p-5 sm:p-6">
      {reports.reports?.length ? <>
        <ul className="space-y-3">{reports.reports.map((report) => {
          const path = googleDraftReturnPath(report.document_id);
          const analysisChanges = report.changes?.filter((change) => change.kind === 'analysis') ?? [];
          const otherChanges = report.changes?.filter((change) => change.kind !== 'analysis') ?? [];
          return <li key={report.document_id} className="relative rounded-xl border border-[#E4EEF9] p-3 text-sm">
            <p className="font-bold">{path && report.status !== 'DELETED' ? <Link className="text-[#0067B3] underline after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]" href={`${path}/verify`}>{documentLabel(report.file_name)}</Link> : documentLabel(report.file_name)}</p>
            <p className="mt-1">{reportStatusMessage(report)}</p>
            {analysisChanges.length > 0 && <p className="mt-1">Analysis changed: {changedFields(analysisChanges)}</p>}
            {otherChanges.length > 0 && <p className="mt-1">Record changed: {changedFields(otherChanges)}</p>}
            {!report.changes?.length && <p className="mt-1">No change details available.</p>}
            {report.status === 'DELETED' && report.restorable && path && <button type="button" disabled={loading || restoring} aria-label={`Recover ${documentLabel(report.file_name)}`} onClick={() => setSelectedRecovery(report)} className="mt-3 min-h-11 cursor-pointer rounded-xl border border-[#B9D6ED] px-4 py-2 font-bold text-[#0067B3] transition hover:bg-[#F0F7FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">Recover document</button>}
          </li>;
        })}</ul>
      </> : (
        <EmptyState
          icon={<CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
          title="No open integrity reports"
          description="There are no unresolved integrity reports for your documents."
        />
      )}
    </div>}
    <Modal open={confirming} onClose={() => { if (!restoring) setConfirming(false); }} title="Restore all documents">
      <p className="text-sm">Restore every document with an open report, including deleted ones? Some may need manual recovery.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-3"><button type="button" disabled={restoring} onClick={() => setConfirming(false)} className="min-h-11 cursor-pointer rounded-xl border border-[#D7E4F2] px-4 py-2 font-bold text-[#4B6382] transition hover:bg-[#F1F7FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">Cancel</button><button type="button" disabled={restoring} onClick={() => void restoreAll()} className="min-h-11 cursor-pointer rounded-xl bg-[#0067B3] px-4 py-2 font-bold text-white transition hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">{restoring ? 'Restoring…' : 'Confirm restore all'}</button></div>
    </Modal>
    <Modal open={selectedRecovery !== null} onClose={() => { if (!restoring) setSelectedRecovery(null); }} title="Recover deleted document">
      <p className="text-sm">Recover {documentLabel(selectedRecovery?.file_name)}? The PDF may not be available.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-3"><button type="button" disabled={restoring} onClick={() => setSelectedRecovery(null)} className="min-h-11 cursor-pointer rounded-xl border border-[#D7E4F2] px-4 py-2 font-bold text-[#4B6382] transition hover:bg-[#F1F7FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">Cancel</button><button type="button" disabled={restoring} onClick={() => void recoverDocument()} className="min-h-11 cursor-pointer rounded-xl bg-[#0067B3] px-4 py-2 font-bold text-white transition hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">{restoring ? 'Recovering…' : 'Confirm recovery'}</button></div>
    </Modal>
  </section>;
}
