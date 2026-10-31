'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { toast } from 'sonner';
import type { ApiSchema } from '@/shared/types/index';
import { attachSignedCopy, correctDocumentEntry, LifecycleRequestError, listDocumentHistory, listDraftComments, listSignedCopies, replaceSignedCopy, signedCopyFileUrl, syncDraftComments } from '@/features/documents/document-lifecycle-api';
import { isGoogleDraftUrl } from '@/features/documents/document-draft-api';
import { getDocumentLifecycleLabel } from '@/features/documents/document-ui';
import { shortenIntegrityHash } from '@/features/verification';
import { GoogleDraftPanel } from '@/features/documents/components/google-draft-panel';
import { listDocumentParties, type PortalUiRole } from '@/features/access';
import { listRegisterBooks } from '@/features/office/books-api';
import { PortalDropdown } from '@/features/portal/components';
import { Checkbox } from '@/shared/components/ui';
import { getRegisterEntryError, getUploadFileError } from '@/features/documents/portal-upload';
import { createWatermarkedSignedPdf } from '@/features/documents/watermark-signed-pdf';

type WorkspaceDocument = ApiSchema<'DocumentResponse'>;

const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p role="status" className="p-4 text-sm text-[#4B6382]">Loading PDF viewer…</p>,
});

const tabs = ['Overview', 'Files', 'Comments', 'Participants', 'Blockchain', 'Activity'] as const;
type Tab = typeof tabs[number];
const overviewSectionHeadingClassName = 'inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]';

function readable(value: unknown): string {
  if (value == null) return 'Not supplied';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const [key, entryValue] = entries[0];
      return `${key} — ${readable(entryValue)}`;
    }
    if (entries.length === 2 && 'type' in value && 'value' in value) {
      return `${readable(value.value)} (${String(value.type).replace(/_/g, ' ').toLowerCase()})`;
    }
    if ('clause' in value && 'severity' in value) {
      return `${value.clause} — ${value.severity}`;
    }
  }
  return JSON.stringify(value);
}

function anchorLabel(lifecycleStatus: string, onChain: boolean) {
  if (onChain) return 'Saved to the blockchain';
  if (lifecycleStatus.toUpperCase() === 'FINALIZED') return 'Waiting for confirmation';
  return 'No blockchain record yet';
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not available';
}

const draftWorkflowStages = ['Draft and review', 'Mark ready for signature', 'Sign and attach the PDF', 'Finalize'] as const;

function DraftProgress({ lifecycle, readinessPending = false }: {
  lifecycle: 'PREPARING' | 'READY_FOR_SIGNATURE' | 'SIGNED' | 'FINALIZED';
  readinessPending?: boolean;
}) {
  const isFinalized = lifecycle === 'FINALIZED';
  const currentStage = lifecycle === 'PREPARING' ? (readinessPending ? 1 : 0)
    : lifecycle === 'READY_FOR_SIGNATURE' ? 2
      : lifecycle === 'SIGNED' ? 3 : 4;

  return (
    <nav aria-label="Draft and filing progress" className="border-b border-[#D7E4F2] pb-5">
      <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4B6382]">{isFinalized ? 'All four steps complete' : `Step ${currentStage + 1} of ${draftWorkflowStages.length}`}</p>
      <ol className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
        {draftWorkflowStages.map((stage, index) => (
          <li key={stage} aria-current={!isFinalized && index === currentStage ? 'step' : undefined} className="flex min-w-0 items-start gap-2.5">
            <span aria-hidden="true" className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isFinalized || index < currentStage ? 'bg-[#E7F5EC] text-[#067647]' : index === currentStage ? 'bg-[#EAF4FF] text-[#0C2B49]' : 'bg-[#F2F5F8] text-[#4B6382]'}`}>
              {isFinalized || index < currentStage ? '✓' : index + 1}
            </span>
            <span className={`text-base leading-6 ${!isFinalized && index === currentStage ? 'font-bold text-[#0C2B49]' : 'font-medium text-[#4B6382]'}`}>
              <span className="sr-only">{isFinalized || index < currentStage ? 'Completed: ' : index === currentStage ? 'Current step: ' : 'Upcoming: '}</span>
              {stage}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function FinalizationNextStep({ document, role, outcomeUnknown }: {
  document: WorkspaceDocument;
  role: PortalUiRole;
  outcomeUnknown: boolean;
}) {
  const heading = outcomeUnknown
    ? 'Check finalization status'
    : document.permissions.can_finalize
      ? 'Finalize the signed PDF'
      : 'Waiting for finalization';
  const guidance = outcomeUnknown
    ? 'The result is not confirmed. Check the status message above before trying again.'
    : document.permissions.can_finalize
      ? 'Finalize the attached PDF to lock this file and start processing. Lawyer review continues afterward.'
      : role === 'lawyer'
        ? 'The document owner will finalize the signed PDF.'
        : 'Your lawyer will finalize the signed PDF.';

  return (
    <section aria-labelledby="finalization-next-step-heading" className="mb-3 border-b border-[#E8F0F8] pb-3">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#4B6382]">Next step</p>
      <h2 id="finalization-next-step-heading" className="mt-1 text-sm font-bold text-[#0C2B49]">{heading}</h2>
      <p className="mt-1 text-sm leading-5 text-[#4B6382]">{guidance}</p>
    </section>
  );
}

function ActivityTimeline({
  changes,
  ariaLabel,
  showActor = false,
}: {
  changes: ApiSchema<'StageChangeResponse'>[];
  ariaLabel: string;
  showActor?: boolean;
}) {
  return (
    <ol aria-label={ariaLabel} className="ml-1 border-l border-[#D7E4F2]">
      {changes.map((change, index) => <li key={`${change.created_at}-${change.action}-${index}`} className="relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2 pl-4 before:absolute before:-left-[5px] before:top-3 before:h-2.5 before:w-2.5 before:rounded-full before:bg-[#0067B3] before:ring-2 before:ring-white">
        <p className="min-w-0 break-words text-sm font-semibold leading-5 text-[#0C2B49]">{getDocumentLifecycleLabel(change.action)}</p>
        <time dateTime={change.created_at} className="row-span-2 shrink-0 text-right text-xs font-medium leading-5 text-[#4B6382]">{formatDate(change.created_at)}</time>
        <p className="min-w-0 break-words text-xs leading-4 text-[#4B6382]">
          {change.from_stage
            ? `Stage changed from ${getDocumentLifecycleLabel(change.from_stage)} to ${getDocumentLifecycleLabel(change.to_stage)}`
            : `Stage set to ${getDocumentLifecycleLabel(change.to_stage)}`}
        </p>
        {showActor && change.actor_id && <details className="col-start-1 mt-1 text-xs text-[#4B6382]">
          <summary className="cursor-pointer font-semibold">Show actor ID</summary>
          <div className="mt-1"><CopyableIdentifier value={change.actor_id} label="actor ID" /></div>
        </details>}
      </li>)}
    </ol>
  );
}

function participantName(party: ApiSchema<'DocumentPartyResponse'>) {
  return [party.f_name, party.l_name].filter(Boolean).join(' ') || party.email;
}

function participantRole(party: ApiSchema<'DocumentPartyResponse'>) {
  if (party.role === 'owner') return 'Lawyer';
  const role = ({ viewer: 'Viewer', signer: 'Signer', editor: 'Editor' } as Record<string, string>)[party.role];
  const access = party.status === 'accepted' ? 'Has access' : party.status === 'pending' ? 'Invitation pending' : null;
  return [role ?? 'Participant', access].filter(Boolean).join(' · ');
}

function ParticipantsPanel({
  documentId,
  canManage,
  isLoading,
  isError,
  people,
  onRetry,
}: {
  documentId: string;
  canManage: boolean;
  isLoading: boolean;
  isError: boolean;
  people: ApiSchema<'DocumentPartyResponse'>[];
  onRetry: () => void;
}) {
  return (
    <section aria-labelledby="participants-heading" className="rounded-xl border border-[#D7E4F2] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="participants-heading" className="inline-flex items-center gap-1.5 text-lg font-bold leading-6 text-[#0C2B49]"><GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Participants</h2>
        {canManage && <Link href={`/portal/documents/${documentId}/participants`} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#D7E4F2] px-2.5 py-1 text-sm font-semibold text-[#0C2B49] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] sm:min-h-9"><ManageAccountsOutlinedIcon aria-hidden="true" sx={{ fontSize: 17 }} />Manage</Link>}
      </div>
      {isLoading && <p role="status" className="mt-3 text-base leading-7 text-[#4B6382]">Loading participants…</p>}
      {isError && <div className="mt-3 flex flex-wrap items-center gap-2"><p role="alert" className="text-base leading-7 text-[#B42318]">Unable to load participants.</p><button type="button" onClick={onRetry} className="min-h-11 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Retry participants</button></div>}
      {!isLoading && !isError && people.length === 0 && <p className="mt-3 text-base leading-7 text-[#4B6382]">No participants are listed yet.</p>}
      {people.length > 0 && <ul aria-label="Participants" className="mt-3 space-y-3 text-base leading-7 text-[#0C2B49]">
        {people.map((person) => <li key={person.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[#E8F0F8] pb-2" title={`${participantName(person)} · ${participantRole(person)}`}><span className="font-medium">{participantName(person)}</span><span className="text-xs text-[#4B6382]">{participantRole(person)}</span></li>)}
      </ul>}
    </section>
  );
}

function DraftCommentsPanel({
  document,
  role,
  comments,
  isLoading,
  isError,
  syncError,
  isSyncing,
  onSync,
  onRetry,
}: {
  document: WorkspaceDocument;
  role: PortalUiRole;
  comments?: ApiSchema<'DraftCommentListResponse'>;
  isLoading: boolean;
  isError: boolean;
  syncError: Error | null;
  isSyncing: boolean;
  onSync: () => void;
  onRetry: () => void;
}) {
  if (!document.draft_url) return null;

  return (
    <section aria-labelledby="draft-comments-heading" className="rounded-xl border border-[#D7E4F2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="draft-comments-heading" className="inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]"><CommentOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Draft comments</h2>
          <p className="mt-1 text-base leading-7 text-[#4B6382]">{document.lifecycle === 'PREPARING' ? 'New comments are checked automatically while the draft is in progress. Use Refresh comments to check Google Docs now.' : 'Comments are no longer checked automatically after the draft is marked ready for signature.'}</p>
        </div>
        {document.lifecycle === 'PREPARING' && document.permissions.can_mark_ready && <button type="button" onClick={onSync} disabled={isSyncing} className="min-h-11 rounded-full border border-[#006BB6] px-4 py-2 text-sm font-bold text-[#006BB6] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">{isSyncing ? 'Refreshing comments…' : 'Refresh comments'}</button>}
      </div>
      {document.lifecycle === 'PREPARING' && role === 'user' && <p className="mt-4 rounded-lg bg-[#F8FBFF] p-4 text-base leading-7 text-[#344054]">Leave feedback with comments (select text, then choose the comment button), not by editing the document. Google Docs suggestions are not shown here.</p>}
      {document.lifecycle === 'PREPARING' && role === 'lawyer' && document.permissions.can_mark_ready && <p className="mt-4 rounded-lg bg-[#F8FBFF] p-4 text-base leading-7 text-[#344054]">Resolve comments and pending Google Docs suggestions before marking the draft ready. Afterward, clients can read the draft but cannot comment. Reopen it if revisions are needed.</p>}
      {isLoading && <p role="status" className="mt-4 text-base leading-7 text-[#4B6382]">Loading comments…</p>}
      {isError && <div className="mt-4 flex flex-wrap items-center gap-2"><p role="alert" className="text-base leading-7 text-[#B42318]">Unable to load draft comments.</p><button type="button" onClick={onRetry} className="min-h-11 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Retry comments</button></div>}
      {syncError && <p role="alert" className="mt-4 text-base font-bold leading-7 text-[#B42318]">{syncError.message || 'Unable to refresh comments.'}</p>}
      {comments && <div className="mt-3 space-y-3">
        <p className="text-base font-bold leading-7 text-[#344054]">{comments.unresolved} unresolved · Last checked {formatDate(comments.synced_at)}</p>
        {comments.comments.length === 0 ? <p className="text-base leading-7 text-[#4B6382]">No comments found in the draft.</p> : comments.comments.map((comment) => <article key={comment.id} className="max-w-4xl space-y-3 rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-5">
          <div className="flex justify-between gap-3"><p className="text-base font-bold leading-6 text-[#0C2B49]">{comment.author_name || 'Draft commenter'}</p><span className="shrink-0 text-sm font-medium text-[#4B6382]">{comment.resolved ? 'Resolved' : 'Unresolved'}</span></div>
          {comment.quoted_text && <blockquote className="break-words border-l-2 border-[#0067B3] pl-3 text-base leading-7 text-[#4B6382]">{comment.quoted_text}</blockquote>}
          <p className="break-words whitespace-pre-wrap text-base leading-7 text-[#0C2B49]">{comment.content}</p>
          {comment.replies?.map((reply, index) => <div key={`${comment.id}-reply-${index}`} className="ml-4 border-l border-[#D6E3F1] pl-4"><p className="text-sm font-bold leading-6 text-[#4B6382]">{reply.author_name || 'Reply'}{reply.action === 'resolve' ? ' · Resolved thread' : reply.action === 'reopen' ? ' · Reopened thread' : ''}</p><p className="break-words whitespace-pre-wrap text-base leading-7 text-[#0C2B49]">{reply.content}</p></div>)}
        </article>)}
      </div>}
    </section>
  );
}

function InsightGroup({ title, items }: { title: string; items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4B6382]">{title}</h3>
      <ul className="mt-2 divide-y divide-[#E8F0F8]">
        {items.map((item, index) => <li key={index} className="py-2 text-sm text-[#0C2B49]">{readable(item)}</li>)}
      </ul>
    </section>
  );
}

function riskDescription(item: unknown) {
  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
    const details = item as Record<string, unknown>;
    const description = details.message ?? details.detail ?? details.description ?? details.clause;
    if (description != null) return readable(description);
  }
  return readable(item);
}

function riskLevel(item: unknown) {
  const severity = typeof item === 'object' && item !== null && !Array.isArray(item)
    ? String((item as Record<string, unknown>).severity ?? '').toLowerCase()
    : '';

  if (severity === 'high') return { label: 'High', badge: 'bg-red-50 text-red-800' };
  if (severity === 'medium') return { label: 'Medium', badge: 'bg-amber-50 text-amber-900' };
  if (severity === 'low') return { label: 'Low', badge: 'bg-emerald-50 text-emerald-800' };
  return { label: 'Review', badge: 'bg-amber-50 text-amber-900' };
}

function RiskFlags({ items }: { items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
      <ul className="divide-y divide-[#E8F0F8]">
        {items.map((item, index) => {
          const level = riskLevel(item);
          const description = riskDescription(item);
          return <li key={index} className="flex items-start justify-between gap-3 py-3 text-base leading-6 text-[#0C2B49]">
            <span title={description} className="line-clamp-2 min-w-0 flex-1">{description}</span>
            <span role="img" aria-label={`${level.label} concern level`} className={`mt-0.5 inline-flex min-h-6 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold ${level.badge}`}>
              {level.label}
            </span>
          </li>;
        })}
      </ul>
  );
}

function SignedPdfPreview({ document }: { document: WorkspaceDocument }) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const pdfDialogRef = useRef<HTMLDialogElement>(null);
  const [watermarkedCopyStatus, setWatermarkedCopyStatus] = useState<'idle' | 'preparing' | 'downloaded' | 'failed'>('idle');
  const signedCopy = document.signed_copy;

  useEffect(() => {
    const dialog = pdfDialogRef.current;
    if (!dialog) return;
    if (pdfViewerOpen && !dialog.open) dialog.showModal();
    else if (!pdfViewerOpen && dialog.open) dialog.close();
  }, [pdfViewerOpen]);

  async function downloadWatermarkedCopy() {
    if (!signedCopy || watermarkedCopyStatus === 'preparing') return;

    setWatermarkedCopyStatus('preparing');
    try {
      const bytes = await createWatermarkedSignedPdf(signedCopyFileUrl(document.document_id, { copyId: signedCopy.id }));
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const link = window.document.createElement('a');
      const baseName = (signedCopy.original_filename ?? document.file_name ?? 'signed-copy.pdf')
        .replace(/\.pdf$/i, '')
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_');
      link.href = objectUrl;
      link.download = `${baseName || 'signed-copy'} - LEXCHAIN COPY.pdf`;
      window.document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setWatermarkedCopyStatus('downloaded');
    } catch {
      setWatermarkedCopyStatus('failed');
    }
  }

  function openPdfViewer() {
    setPdfLoading(true);
    setPdfViewerOpen(true);
  }

  return (
    <section aria-labelledby="signed-pdf-preview-heading" className="flex min-w-0 flex-col rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="signed-pdf-preview-heading" className="inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]"><PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Signed PDF</h2>
          {signedCopy && <p className="mt-1 break-words text-sm leading-5 text-[#4B6382]">{signedCopy.original_filename ?? document.file_name}</p>}
        </div>
        {signedCopy && <button type="button" onClick={() => void downloadWatermarkedCopy()} disabled={watermarkedCopyStatus === 'preparing'} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#D7E4F2] px-2.5 py-1 text-sm font-semibold text-[#0C2B49] hover:bg-[#EAF4FF] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] sm:min-h-9">
          <DownloadOutlinedIcon aria-hidden="true" sx={{ fontSize: 17 }} />{watermarkedCopyStatus === 'preparing' ? 'Preparing copy…' : 'Download PDF Copy'}
        </button>}
      </div>
      {signedCopy && <p aria-live="polite" className="mt-2 text-xs leading-5 text-[#4B6382]">
        {watermarkedCopyStatus === 'failed'
          ? 'Could not create the watermarked copy. The signed original is unchanged.'
          : watermarkedCopyStatus === 'downloaded'
            ? 'Watermarked PDF copy downloaded. The signed original remains unchanged for integrity checks.'
            : 'This copy includes the LEXCHAIN COPY watermark. The signed original remains unchanged for integrity checks.'}
      </p>}

      {signedCopy ? (
        <div className="mt-4 flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#C9DDF2] bg-[#F8FBFF] px-4 py-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#EAF4FF] text-[#0067B3]">
            <PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 28 }} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0C2B49]">Open the signed PDF</p>
            <p className="mt-1 text-sm text-[#4B6382]">View pages and zoom in a full-screen viewer.</p>
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls="signed-pdf-viewer-dialog"
            onClick={openPdfViewer}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0673C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
          >
            <PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />View PDF
          </button>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-[#F8FBFF] p-4 text-base leading-7 text-[#4B6382]">No signed PDF is attached to this document yet.</p>
      )}

      {signedCopy && <dialog
        ref={pdfDialogRef}
        id="signed-pdf-viewer-dialog"
        aria-labelledby="signed-pdf-viewer-title"
        onClose={() => setPdfViewerOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-transparent backdrop:backdrop-blur-md"
      >
        <div className="flex h-full min-h-0 flex-col bg-transparent">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#D7E4F2]/70 bg-transparent px-4 py-3 text-[#0C2B49] backdrop-blur-sm sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4B6382]">Signed PDF</p>
              <h2 id="signed-pdf-viewer-title" className="truncate text-base font-bold sm:text-lg">{signedCopy.original_filename ?? document.file_name ?? 'Signed PDF'}</h2>
            </div>
            <button
              type="button"
              aria-label="Close PDF viewer"
              autoFocus
              onClick={() => setPdfViewerOpen(false)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-[#D7E4F2] bg-white/70 text-[#0C2B49] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
            >
              <CloseOutlinedIcon aria-hidden="true" sx={{ fontSize: 20 }} />
            </button>
          </header>
          <div className="flex min-h-0 flex-1 justify-center p-2 sm:p-4 lg:p-6">
            <div className="relative flex min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden rounded-xl bg-transparent p-2 sm:p-3">
              {pdfViewerOpen && <PdfDocumentViewer
                sourceUrl={signedCopyFileUrl(document.document_id, { copyId: signedCopy.id })}
                watermarkText="LEXCHAIN COPY"
                continuous
                currentPage={0}
                blocks={[]}
                selectedBlockIndex={null}
                hoveredBlockIndex={null}
                onPageChange={() => undefined}
                onSelectBlock={() => undefined}
                onHoverBlockChange={() => undefined}
                onLoadChange={setPdfLoading}
              />}
              {pdfLoading && <div role="status" aria-label="Loading signed PDF" className="absolute inset-0 flex items-center justify-center bg-[#0C2B49]/70 backdrop-blur-sm"><span className="text-sm font-semibold text-white">Loading signed PDF…</span></div>}
            </div>
          </div>
        </div>
      </dialog>}
    </section>
  );
}

export function CopyableIdentifier({ value, label }: { value: string; label: string }) {
  const [copyState, setCopyState] = useState<'copied' | 'failed' | null>(null);

  async function copyValue() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable');
      await navigator.clipboard.writeText(value);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
      <code className="break-all font-mono">{shortenIntegrityHash(value)}</code>
      <button type="button" onClick={() => void copyValue()} aria-label={`Copy ${label}`} className="min-h-11 rounded-full border border-[#D7E4F2] bg-white px-3 py-2 text-xs font-bold text-[#0C2B49] hover:bg-[#EAF4FF]">
        {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Try again' : 'Copy'}
      </button>
      <span aria-live="polite" className="sr-only">{copyState === 'copied' ? `${label} copied` : copyState === 'failed' ? `Could not copy ${label}` : ''}</span>
    </span>
  );
}

type DocumentWorkspaceProps = {
  className?: string;
  document: WorkspaceDocument;
  role?: PortalUiRole;
  readinessError?: Error | null;
  isChangingReadiness?: boolean;
  finalizationOutcomeUnknown?: boolean;
  onMarkReady?: () => void;
  onReopen?: () => void;
  onDocumentUpdated?: (document: WorkspaceDocument) => void;
};

export function DocumentWorkspace({
  className,
  document,
  role = 'user',
  readinessError,
  isChangingReadiness = false,
  finalizationOutcomeUnknown = false,
  onMarkReady,
  onReopen,
  onDocumentUpdated = () => undefined,
}: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const isDrafting = document.lifecycle === 'PREPARING' || document.lifecycle === 'READY_FOR_SIGNATURE';
  const hasGoogleDraft = isGoogleDraftUrl(document.draft_url ?? '');
  const [signedCopyMode, setSignedCopyMode] = useState<'attach' | 'replace' | null>(null);
  const signedCopyFileInput = useRef<HTMLInputElement>(null);
  const [signedCopyFile, setSignedCopyFile] = useState<File | null>(null);
  const [signedCopyDragOver, setSignedCopyDragOver] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');
  const [signedCopyBookId, setSignedCopyBookId] = useState(document.book_id ?? '');
  const [enterPaperNumbers, setEnterPaperNumbers] = useState(false);
  const [signedCopyError, setSignedCopyError] = useState<string | null>(null);
  const [reviewedSuggestionsFor, setReviewedSuggestionsFor] = useState<string | null>(null);
  const [correctingEntry, setCorrectingEntry] = useState(false);
  const [entryBookId, setEntryBookId] = useState(document.book_id ?? '');
  const [entryDocNo, setEntryDocNo] = useState(document.doc_no == null ? '' : String(document.doc_no));
  const [entryPageNo, setEntryPageNo] = useState(document.page_no == null ? '' : String(document.page_no));
  const [entryCorrectionValidationError, setEntryCorrectionValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const canCorrectEntry = document.permissions?.can_correct_entry === true
    && document.lifecycle.trim().toUpperCase() === 'SIGNED';
  const registerBooksQuery = useQuery({
    queryKey: ['portal-books'],
    queryFn: listRegisterBooks,
    enabled: (!isDrafting && activeTab === 'Overview' && role === 'lawyer' && Boolean(document.book_id)) || (correctingEntry && canCorrectEntry) || signedCopyMode === 'attach',
    retry: false,
    refetchInterval: 15_000,
  });
  const selectedSignedCopyBook = registerBooksQuery.data?.find((book) => book.id === signedCopyBookId);
  const signedCopyUsesManualNumbers = selectedSignedCopyBook?.status === 'CLOSED' || enterPaperNumbers;
  const signedCopyMutation = useMutation({
    mutationFn: ({ mode, file, reason }: { mode: 'attach' | 'replace'; file: File; reason: string }) => mode === 'attach'
      ? attachSignedCopy(document.document_id, file, {
          bookId: signedCopyBookId,
          docNo: signedCopyUsesManualNumbers ? Number(entryDocNo) : null,
          pageNo: signedCopyUsesManualNumbers ? Number(entryPageNo) : null,
        })
      : replaceSignedCopy(document.document_id, file, reason),
    onSuccess: async (updatedDocument, { mode }) => {
      queryClient.setQueryData(['portal-doc', document.document_id], updatedDocument);
      setSignedCopyMode(null);
      setSignedCopyFile(null);
      setReplacementReason('');
      setSignedCopyError(null);
      toast.success(mode === 'attach' ? 'Signed PDF attached.' : 'Signed PDF replaced.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', document.document_id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-doc-signed-copies', document.document_id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
      ]);
    },
  });
  const correctEntryMutation = useMutation({
    mutationFn: (entry: ApiSchema<'CorrectEntryRequest'>) => correctDocumentEntry(document.document_id, entry),
    onSuccess: async (updatedDocument) => {
      queryClient.setQueryData(['portal-doc', document.document_id], updatedDocument);
      setCorrectingEntry(false);
      setEntryCorrectionValidationError(null);
      toast.success('Register entry corrected.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', document.document_id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-book'] }),
      ]);
    },
  });
  const signedCopiesQuery = useQuery({ queryKey: ['portal-doc-signed-copies', document.document_id], queryFn: () => listSignedCopies(document.document_id), enabled: !isDrafting && activeTab === 'Files', refetchInterval: 15_000 });
  const partiesQuery = useQuery({
    queryKey: ['portal-document-parties', document.document_id],
    queryFn: () => listDocumentParties(document.document_id),
    enabled: isDrafting || activeTab === 'Overview',
    retry: false,
    refetchInterval: 15_000,
  });
  const historyQuery = useQuery({
    queryKey: ['portal-document-history', document.document_id],
    queryFn: () => listDocumentHistory(document.document_id),
    enabled: !isDrafting && (activeTab === 'Activity' || activeTab === 'Overview'),
    retry: false,
    refetchInterval: 15_000,
  });
  const commentsKey = ['portal-document-comments', document.document_id];
  const commentsQuery = useQuery({ queryKey: commentsKey, queryFn: () => listDraftComments(document.document_id), enabled: (isDrafting || activeTab === 'Comments') && Boolean(document.draft_url), retry: false, refetchInterval: 15_000 });
  const syncComments = useMutation({ mutationFn: () => syncDraftComments(document.document_id), onSuccess: (comments) => queryClient.setQueryData(commentsKey, comments) });
  const unresolvedCommentCount = commentsQuery.data?.unresolved;
  const suggestionsReviewed = reviewedSuggestionsFor === document.document_id;
  const readinessBlocked = commentsQuery.isLoading || commentsQuery.isError || syncComments.isPending || syncComments.isError || unresolvedCommentCount !== 0 || !suggestionsReviewed;
  const registerBooks = registerBooksQuery.data ?? [];
  const registerBookOptions = [
    { label: document.book_id ? 'Keep current book' : 'Use current book', value: '' },
    ...(document.book_id && !registerBooks.some((book) => book.id === document.book_id)
      ? [{ label: 'Current register book', value: document.book_id }]
      : []),
    ...registerBooks.map((book) => ({
      label: `Register book ${book.book_number} — Series ${book.series_year} · ${book.status === 'CLOSED' ? 'Closed' : 'Open'}`,
      value: book.id,
    })),
  ];
  const canManageParticipants = role === 'lawyer' && (document.permissions.can_share || document.permissions.can_revoke);
  const visibleTabs = isDrafting ? [] : tabs.filter((tab) => (tab !== 'Comments' || Boolean(document.draft_url)) && (tab !== 'Participants' || canManageParticipants));
  useEffect(() => {
    if (signedCopyMode === 'attach') signedCopyFileInput.current?.focus({ preventScroll: true });
  }, [signedCopyMode]);
  const hasReviewDetails = Boolean(document.labels?.length || document.entities?.length);
  const people = partiesQuery.data
    ? [partiesQuery.data.issuer, ...(partiesQuery.data.parties ?? []).filter((party) => party.status !== 'declined')]
    : [];
  const earlierSignedCopies = signedCopiesQuery.data?.copies.filter((copy) => !copy.is_current) ?? [];
  const historyChanges = historyQuery.data?.changes ?? [];
  const registerBook = registerBooks.find((book) => book.id === document.book_id);
  const registerEntry = [
    role === 'lawyer' ? (!document.book_id ? 'Book not assigned' : registerBooksQuery.isLoading ? 'Loading book details' : registerBook ? `Book ${registerBook.book_number}` : 'Book unavailable') : null,
    role === 'lawyer' && registerBook ? `Series ${registerBook.series_year}` : role === 'lawyer' && document.book_id && registerBooksQuery.isLoading ? 'Series loading' : role === 'lawyer' && document.book_id ? 'Series unavailable' : null,
    document.doc_no != null ? `Document ${document.doc_no}` : null,
    document.page_no != null ? `Page ${document.page_no}` : null,
  ].filter(Boolean).join(' · ') || 'Not assigned';

  const draftCommentsPanel = <DraftCommentsPanel
    document={document}
    role={role}
    comments={commentsQuery.data}
    isLoading={commentsQuery.isLoading}
    isError={commentsQuery.isError}
    syncError={syncComments.error}
    isSyncing={syncComments.isPending}
    onSync={() => { setReviewedSuggestionsFor(null); syncComments.mutate(); }}
    onRetry={() => { void commentsQuery.refetch(); }}
  />;

  const participantsPanel = <ParticipantsPanel
    documentId={document.document_id}
    canManage={canManageParticipants}
    isLoading={partiesQuery.isLoading}
    isError={partiesQuery.isError}
    people={people}
    onRetry={() => { void partiesQuery.refetch(); }}
  />;

  function openEntryCorrection() {
    setEntryBookId(document.book_id ?? '');
    setEntryDocNo(document.doc_no == null ? '' : String(document.doc_no));
    setEntryPageNo(document.page_no == null ? '' : String(document.page_no));
    setEntryCorrectionValidationError(null);
    correctEntryMutation.reset();
    setCorrectingEntry(true);
  }

  function submitEntryCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const docNo = Number(entryDocNo);
    const pageNo = Number(entryPageNo);
    if (!Number.isSafeInteger(docNo) || docNo < 1) {
      setEntryCorrectionValidationError('Document number must be a positive whole number.');
      return;
    }
    if (!Number.isSafeInteger(pageNo) || pageNo < 1) {
      setEntryCorrectionValidationError('Page number must be a positive whole number.');
      return;
    }

    setEntryCorrectionValidationError(null);
    const bookId = entryBookId || document.book_id;
    correctEntryMutation.mutate({
      ...(bookId ? { book_id: bookId } : {}),
      doc_no: docNo,
      page_no: pageNo,
    });
  }

  function openSignedCopyForm() {
    setActiveTab(isDrafting ? 'Overview' : 'Files');
    setSignedCopyMode('attach');
    setSignedCopyError(null);
    signedCopyMutation.reset();
  }

  function selectSignedCopyFile(file: File | null) {
    const fileError = file ? getUploadFileError(file) : null;
    setSignedCopyFile(fileError ? null : file);
    setSignedCopyError(fileError);
  }

  function submitSignedCopy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mode = signedCopyMode;
    if (!mode) return;
    if (!signedCopyFile) {
      setSignedCopyError('Choose a signed PDF file.');
      return;
    }
    const fileError = getUploadFileError(signedCopyFile);
    if (fileError) {
      setSignedCopyError(fileError);
      return;
    }
    if (mode === 'replace' && !replacementReason.trim()) {
      setSignedCopyError('Enter a replacement reason.');
      return;
    }
    if (mode === 'attach') {
      const filingError = getRegisterEntryError({
        bookId: selectedSignedCopyBook?.id ?? '',
        bookStatus: selectedSignedCopyBook?.status,
        manualNumbers: signedCopyUsesManualNumbers,
        docNo: entryDocNo,
        pageNo: entryPageNo,
      });
      if (filingError) {
        setSignedCopyError(filingError);
        return;
      }
    }
    setSignedCopyError(null);
    signedCopyMutation.mutate({ mode, file: signedCopyFile, reason: replacementReason });
  }

  const signedCopyForm = signedCopyMode && <form aria-labelledby="signed-copy-form-heading" className="space-y-3 border-t border-[#E8F0F8] py-4" onSubmit={submitSignedCopy}>
    <div>
      <h3 id="signed-copy-form-heading" className="text-base font-bold text-[#0C2B49]">{signedCopyMode === 'attach' ? 'Attach the signed PDF to this record' : 'Replace the signed PDF'}</h3>
    {signedCopyMode === 'attach' && <p className="mt-1 max-w-2xl text-sm leading-5 text-[#4B6382]">Upload the signed PDF, including any required notary stamp. It will be added to this same document record with its register details.</p>}
    </div>
    <div className="space-y-2">
      <p className="text-sm font-bold text-[#0C2B49]">Signed PDF</p>
      <label
        onDragOver={(event) => { event.preventDefault(); if (!signedCopyMutation.isPending) setSignedCopyDragOver(true); }}
        onDragLeave={() => setSignedCopyDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setSignedCopyDragOver(false);
          if (!signedCopyMutation.isPending) selectSignedCopyFile(event.dataTransfer.files[0] ?? null);
        }}
        aria-disabled={signedCopyMutation.isPending}
        className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition focus-within:ring-2 focus-within:ring-[#0067B3] focus-within:ring-offset-2 ${signedCopyDragOver ? 'border-[#0067B3] bg-[#EEF6FF]' : 'border-[#B8C9D9] bg-[#F8FBFF] hover:border-[#0067B3]'} ${signedCopyMutation.isPending ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input ref={signedCopyFileInput} aria-label="Signed PDF" aria-required="true" type="file" accept="application/pdf,.pdf" disabled={signedCopyMutation.isPending} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" onChange={(event) => selectSignedCopyFile(event.currentTarget.files?.[0] ?? null)} />
        <UploadFileIcon aria-hidden="true" sx={{ fontSize: 36, color: '#0067B3' }} />
        <p className="mt-2 text-base font-bold leading-6 text-[#0C2B49]">{signedCopyFile ? 'Signed PDF selected' : 'Drop your signed PDF here'}</p>
        {signedCopyFile && <p className="mt-1 max-w-full break-all text-sm font-semibold text-[#344054]">{signedCopyFile.name}</p>}
        <span className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[#0067B3] bg-white px-4 py-2 text-sm font-bold text-[#006BB6]">{signedCopyFile ? 'Choose a different PDF' : 'Choose a PDF'}</span>
        <p className="mt-2 text-xs font-medium text-[#4B6382]">PDF only · maximum 60 MiB</p>
      </label>
    </div>
    {signedCopyMode === 'attach' && <>
      <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Register book
        <PortalDropdown
          ariaLabel="Register book"
          placeholder="Choose a register book"
          emptyLabel={registerBooksQuery.isLoading ? 'Loading register books...' : 'No register books available'}
          options={(registerBooksQuery.data ?? []).map((book) => ({ label: `Register book ${book.book_number} — Series ${book.series_year} · ${book.status === 'CLOSED' ? 'Closed' : 'Open'}`, value: book.id }))}
          value={signedCopyBookId}
          onChange={(value) => { setSignedCopyBookId(value); setEntryDocNo(''); setEntryPageNo(''); setEnterPaperNumbers(false); setSignedCopyError(null); }}
          disabled={registerBooksQuery.isLoading || !registerBooksQuery.data?.length || signedCopyMutation.isPending}
        />
      </label>
      {registerBooksQuery.isError && <div className="flex flex-wrap items-center gap-2"><p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load register books. Retry to attach the signed PDF.</p><button type="button" onClick={() => void registerBooksQuery.refetch()} className="min-h-11 rounded-full border border-[#D7E4F2] px-3 py-1.5 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Retry register books</button></div>}
      {selectedSignedCopyBook?.status === 'OPEN' && <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0C2B49]"><Checkbox checked={enterPaperNumbers} disabled={signedCopyMutation.isPending} onChange={(event) => { setEnterPaperNumbers(event.target.checked); setSignedCopyError(null); }} />Enter paper register numbers</label>}
      {selectedSignedCopyBook?.status === 'CLOSED' && <p className="text-sm text-[#4B6382]">Closed books require the Doc. No. and Page No. shown in the paper register.</p>}
      {signedCopyUsesManualNumbers && selectedSignedCopyBook && <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Paper document number<input aria-label="Paper document number" min="1" step="1" inputMode="numeric" type="number" value={entryDocNo} disabled={signedCopyMutation.isPending} onChange={(event) => setEntryDocNo(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Paper page number<input aria-label="Paper page number" min="1" step="1" inputMode="numeric" type="number" value={entryPageNo} disabled={signedCopyMutation.isPending} onChange={(event) => setEntryPageNo(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>
      </div>}
    </>}
    {signedCopyMode === 'replace' && <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Replacement reason<textarea aria-label="Replacement reason" required value={replacementReason} disabled={signedCopyMutation.isPending} onChange={(event) => setReplacementReason(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>}
    {signedCopyError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyError}</p>}
    {signedCopyMutation.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyMutation.error instanceof Error ? signedCopyMutation.error.message : 'Upload failed.'} Your selected file and {signedCopyMode === 'attach' ? 'filing details' : 'replacement reason'} have been kept. Review the error and retry.</p>}
    <div className="flex flex-wrap gap-2"><button type="submit" disabled={!signedCopyFile || (signedCopyMode === 'replace' && !replacementReason.trim()) || (signedCopyMode === 'attach' && !selectedSignedCopyBook) || signedCopyMutation.isPending} className="min-h-11 rounded-full bg-[#0673C4] px-4 py-2 text-sm font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50">{signedCopyMutation.isPending ? 'Uploading…' : signedCopyMode === 'replace' ? 'Confirm replacement' : 'Confirm attachment'}</button><button type="button" disabled={signedCopyMutation.isPending} onClick={() => { setSignedCopyMode(null); setSignedCopyFile(null); setReplacementReason(''); setSignedCopyError(null); signedCopyMutation.reset(); }} className="min-h-11 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button></div>
  </form>;

  const nextStepHeading = document.lifecycle === 'PREPARING'
    ? !hasGoogleDraft ? 'Start with the Google Doc' : 'Review the draft before continuing'
    : role === 'lawyer' && document.permissions.can_attach_signed_copy ? 'Complete signing outside LexChain' : 'Waiting for the signed PDF';
  const nextStepGuidance = document.lifecycle === 'PREPARING'
    ? !hasGoogleDraft
      ? role === 'lawyer' && document.permissions.can_create_draft
        ? 'Create or link the Google Doc in Working draft above. Once it is linked, review and resolve comments before marking it ready.'
        : 'Your lawyer is preparing the Google Doc. It will appear above when it is linked to this record.'
      : role === 'lawyer'
        ? 'Review the wording in Google Docs, then confirm below when the draft is ready.'
        : 'Review the Google Doc and leave feedback in its comments. Your lawyer will mark it ready when the text is settled.'
    : role === 'lawyer' && document.permissions.can_attach_signed_copy
      ? 'Print the approved text, collect signatures and any required notary stamp, then upload the signed PDF here. It will be attached to this same record with its register details.'
      : role === 'lawyer'
        ? 'The document owner will attach the signed PDF to this record after signing.'
        : 'Your lawyer is arranging signatures outside LexChain and will add the signed PDF to this same record.';
  const nextStepPanel = <section aria-labelledby="next-step-heading" className="rounded-xl border-l-4 border-[#0673C4] bg-[#F4F8FC] p-5 sm:p-6">
    <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#4B6382]">What happens next</p>
    <h2 id="next-step-heading" className="mt-1 text-xl font-bold leading-7 text-[#0C2B49]">{nextStepHeading}</h2>
    <p className="mt-2 max-w-3xl text-base leading-7 text-[#344054]">{nextStepGuidance}</p>
    {document.lifecycle === 'PREPARING' && readinessError && <div role="alert" className="mt-4 space-y-2 rounded-lg bg-red-50 p-4 text-base font-bold leading-7 text-[#B42318]">
      <p>{readinessError.message}</p>
      {readinessError instanceof LifecycleRequestError && readinessError.reason === 'UNRESOLVED_COMMENTS' && <>
        {typeof readinessError.unresolved === 'number' && Number.isInteger(readinessError.unresolved) && readinessError.unresolved >= 0 && <p>{readinessError.unresolved} unresolved comments remain.</p>}
        {typeof readinessError.draftUrl === 'string' && isGoogleDraftUrl(readinessError.draftUrl) && <a className="underline" href={readinessError.draftUrl} target="_blank" rel="noreferrer">Open Google draft to resolve comments</a>}
      </>}
    </div>}

    {document.lifecycle === 'PREPARING' && hasGoogleDraft && document.permissions.can_mark_ready && <div className="mt-5 border-t border-[#D7E4F2] pt-5">
      <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#344054]">Before marking ready</p>
      {commentsQuery.isLoading && <p role="status" className="mt-2 text-base leading-7 text-[#344054]">Checking unresolved comments…</p>}
      {commentsQuery.isError && <p role="alert" className="mt-2 text-base leading-7 text-[#B42318]">Comments could not be checked. Retry comments above before continuing.</p>}
      {syncComments.isPending && <p role="status" className="mt-2 text-base leading-7 text-[#344054]">Refreshing comments…</p>}
      {syncComments.isError && <p role="alert" className="mt-2 text-base leading-7 text-[#B42318]">Comments could not be refreshed. Choose Refresh comments above before continuing.</p>}
      {typeof unresolvedCommentCount === 'number' && unresolvedCommentCount > 0 && <p role="status" className="mt-2 text-base leading-7 text-[#B42318]">Resolve {unresolvedCommentCount} unresolved {unresolvedCommentCount === 1 ? 'comment' : 'comments'} in Google Docs, then refresh comments before marking the draft ready.</p>}
      {unresolvedCommentCount === 0 && !commentsQuery.isLoading && !commentsQuery.isError && !syncComments.isPending && !syncComments.isError && <>
        <p role="status" className="mt-2 text-base leading-7 text-[#344054]">All comments are resolved.</p>
        <label className="mt-3 flex min-h-11 items-start gap-2.5 text-sm font-semibold leading-6 text-[#344054]">
          <Checkbox checked={suggestionsReviewed} onChange={(event) => setReviewedSuggestionsFor(event.target.checked ? document.document_id : null)} className="mt-1" />
          <span>I checked Google Docs and resolved any pending suggestions.</span>
        </label>
      </>}
      <button type="button" onClick={onMarkReady} disabled={isChangingReadiness || readinessBlocked} className="mt-4 min-h-12 rounded-full bg-[#0673C4] px-5 py-3 text-base font-bold text-white hover:bg-[#005FA3] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">{isChangingReadiness ? 'Updating…' : 'Mark ready for signature'}</button>
    </div>}

    {document.lifecycle === 'READY_FOR_SIGNATURE' && <div className="mt-5 flex flex-wrap gap-3 border-t border-[#D7E4F2] pt-5">
      {document.permissions.can_attach_signed_copy && !signedCopyMode && <button type="button" onClick={openSignedCopyForm} className="min-h-12 rounded-full bg-[#0673C4] px-5 py-3 text-base font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Attach signed PDF</button>}
      {document.permissions.can_reopen && <button type="button" onClick={() => { setReviewedSuggestionsFor(null); onReopen?.(); }} disabled={isChangingReadiness} className="min-h-12 rounded-full border border-[#B8C9D9] bg-white px-5 py-3 text-base font-bold text-[#0C2B49] hover:bg-[#EAF4FF] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Reopen draft</button>}
    </div>}
    {document.lifecycle === 'READY_FOR_SIGNATURE' && signedCopyMode === 'attach' && signedCopyForm}
  </section>;

  return (
    <section className={`mx-auto flex min-h-0 w-full flex-col bg-transparent ${isDrafting ? 'overflow-hidden' : 'max-w-7xl'} ${className ?? ''}`}>
      {isDrafting ? (
        <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <header className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#4B6382]">{document.lifecycle === 'PREPARING' ? 'Drafting workspace' : 'Ready for signature'}</p>
            <h2 className="mt-1 text-xl font-bold leading-7 text-[#0C2B49]">{document.lifecycle === 'PREPARING' ? 'Prepare and review the document' : 'Sign the document and return the PDF'}</h2>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#344054]">{document.lifecycle === 'PREPARING' ? 'The Google Doc is the working draft. Comments and participants stay with this record while you agree on the text.' : 'Signing happens outside LexChain. Upload the signed PDF here to keep it attached to this same record.'}</p>
          </header>

          <DraftProgress lifecycle={document.lifecycle === 'PREPARING' ? 'PREPARING' : 'READY_FOR_SIGNATURE'} readinessPending={document.lifecycle === 'PREPARING' && isChangingReadiness} />

          <div className="mt-6 flex flex-col gap-6 pb-6">
            <section aria-labelledby="working-draft-heading" className="space-y-3">
              <h2 id="working-draft-heading" className="text-xl font-bold leading-7 text-[#0C2B49]">{document.lifecycle === 'PREPARING' ? 'Working draft' : 'Approved text'}</h2>
              <p className="max-w-3xl text-base leading-7 text-[#344054]">{document.lifecycle === 'PREPARING'
                ? hasGoogleDraft ? 'Open the Google Doc to review and edit the agreed text.' : document.draft_url ? 'The linked Google Doc needs attention before this draft can be reviewed.' : 'Create or link a Google Doc to start drafting. Comments and participants will stay with this record.'
                : 'Open the approved Google Doc to print the version for signing.'}</p>
              {document.draft_url || (document.lifecycle === 'PREPARING' && document.permissions.can_create_draft)
                ? <GoogleDraftPanel document={document} onDocumentUpdated={onDocumentUpdated} />
                : <p role="note" className="rounded-xl border border-[#D7E4F2] bg-white p-5 text-base leading-7 text-[#344054]">{document.lifecycle === 'PREPARING' ? role === 'lawyer' ? 'A working draft is not linked yet. Ask the document owner to create or link the Google Doc.' : 'Your lawyer is preparing the working draft. It will appear here when available.' : 'No Google Doc is linked to this record. Continue with the external signing instructions below.'}</p>}
            </section>

            {document.lifecycle === 'READY_FOR_SIGNATURE' && nextStepPanel}
            {participantsPanel}
            {draftCommentsPanel}
            {document.lifecycle === 'PREPARING' && nextStepPanel}
          </div>
        </div>
      ) : (
        <>
      <div role="tablist" aria-label="Document workspace" className="flex shrink-0 overflow-x-auto border-b border-[#D7E4F2] px-4 sm:px-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-t-md border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0067B3] ${activeTab === tab ? 'border-[#0067B3] text-[#0C2B49]' : 'border-transparent text-[#4B6382] hover:text-[#0C2B49]'}`}
          >
            {tab === 'Blockchain' && <AccountTreeIcon aria-hidden="true" sx={{ fontSize: 18, color: '#0067B3' }} />}
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-0 w-full flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {activeTab === 'Overview' && (
          <div className="min-w-0">
            <div className="space-y-4">
              {document.lifecycle === 'SIGNED' && <FinalizationNextStep document={document} role={role} outcomeUnknown={finalizationOutcomeUnknown} />}
              {document.draft_url && <GoogleDraftPanel document={document} onDocumentUpdated={onDocumentUpdated} />}
              <section aria-labelledby="document-summary-heading" className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                <h2 id="document-summary-heading" className="inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]"><DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document summary</h2>
                <p className="mt-2 break-words text-base leading-7 text-[#344054]">{document.summary || 'No summary is available for this document yet.'}</p>
                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-[#E8F0F8] pt-4 text-xs sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2"><dt className="font-semibold leading-4 text-[#4B6382]">Register entry</dt><dd className="mt-1 break-words text-sm font-medium leading-5 text-[#0C2B49]">{registerEntry}</dd></div>
                  <div><dt className="font-semibold leading-4 text-[#4B6382]">Created</dt><dd className="mt-1 text-sm font-medium leading-5 text-[#0C2B49]">{formatDate(document.created_at)}</dd></div>
                  {document.lifecycle === 'FINALIZED' && <div><dt className="font-semibold leading-4 text-[#4B6382]">Finalized</dt><dd className="mt-1 text-sm font-medium leading-5 text-[#0C2B49]">{formatDate(document.finalized_at)}</dd></div>}
                </dl>
              </section>

              {participantsPanel}

              {canCorrectEntry && <div className="space-y-3 border-t border-[#E8F0F8] py-3">
                {!correctingEntry ? <button type="button" onClick={openEntryCorrection} className="inline-flex items-center gap-1.5 rounded-full border border-[#0067B3] px-4 py-2 text-sm font-extrabold text-[#0067B3]"><EditOutlinedIcon aria-hidden="true" sx={{ fontSize: 17 }} />Correct register entry</button> : <form aria-labelledby="correct-entry-heading" className="space-y-3 rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-4" onSubmit={submitEntryCorrection}>
                  <h3 id="correct-entry-heading" className="inline-flex items-center gap-1.5 text-sm font-black text-[#0C2B49]"><EditOutlinedIcon aria-hidden="true" sx={{ fontSize: 17, color: '#0067B3' }} />Correct document register entry</h3>
                  <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Register book
                    <PortalDropdown ariaLabel="Register book" placeholder="Choose a register book" emptyLabel={registerBooksQuery.isLoading ? 'Loading register books…' : 'No register books available'} options={registerBookOptions} value={entryBookId} onChange={setEntryBookId} disabled={registerBooksQuery.isLoading || correctEntryMutation.isPending} />
                  </label>
                  {registerBooksQuery.isLoading && <p role="status" className="text-sm text-[#4B6382]">Loading register books…</p>}
                  {registerBooksQuery.isError && <div className="flex flex-wrap items-center gap-2"><p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load register books. You can keep the current book or retry to choose another.</p><button type="button" onClick={() => void registerBooksQuery.refetch()} className="rounded-full border border-[#D7E4F2] px-3 py-1.5 text-xs font-bold text-[#0C2B49]">Retry books</button></div>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Document number<input aria-label="Document number" required min="1" step="1" inputMode="numeric" type="number" value={entryDocNo} disabled={correctEntryMutation.isPending} onChange={(event) => { setEntryDocNo(event.target.value); setEntryCorrectionValidationError(null); }} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>
                    <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Page number<input aria-label="Page number" required min="1" step="1" inputMode="numeric" type="number" value={entryPageNo} disabled={correctEntryMutation.isPending} onChange={(event) => { setEntryPageNo(event.target.value); setEntryCorrectionValidationError(null); }} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>
                  </div>
                  {entryCorrectionValidationError && <p role="alert" className="text-sm font-bold text-[#B42318]">{entryCorrectionValidationError}</p>}
                  {correctEntryMutation.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{correctEntryMutation.error instanceof Error ? correctEntryMutation.error.message : 'Unable to correct the register entry.'} Your entered values have been kept.</p>}
                  <div className="flex flex-wrap gap-2"><button type="submit" disabled={correctEntryMutation.isPending} className="rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{correctEntryMutation.isPending ? 'Saving…' : 'Save correction'}</button><button type="button" disabled={correctEntryMutation.isPending} onClick={() => { setCorrectingEntry(false); setEntryCorrectionValidationError(null); correctEntryMutation.reset(); }} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button></div>
                </form>}
              </div>}

              <div className="grid gap-4">
                <section aria-labelledby="potential-concerns-heading" className="space-y-3 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                  <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <h2 id="potential-concerns-heading" className={overviewSectionHeadingClassName}><WarningAmberOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#B77900' }} />Potential concerns</h2>
                    <p className="text-sm leading-5 text-[#4B6382]">AI review · verify against original</p>
                  </div>
                  {document.risk_flags?.length ? <RiskFlags items={document.risk_flags} /> : <p className="text-base leading-7 text-[#4B6382]">No review findings are available for this document yet.</p>}
                </section>

                {hasReviewDetails && <details className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                    <summary className="min-h-11 cursor-pointer py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
                      <span className={overviewSectionHeadingClassName}><DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Extracted details</span>{' '}
                      <span className="text-sm font-normal leading-5 text-[#4B6382]">({document.labels?.length ?? 0} labels · {document.entities?.length ?? 0} entities)</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <InsightGroup title="Labels" items={document.labels} />
                      <InsightGroup title="Entities" items={document.entities} />
                    </div>
                </details>}

                <section aria-labelledby="recent-activity-heading" className="space-y-3 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                  <div className="flex min-h-11 items-center justify-between gap-3">
                    <h2 id="recent-activity-heading" className={overviewSectionHeadingClassName}><HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Recent activity</h2>
                    <button type="button" onClick={() => setActiveTab('Activity')} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0067B3] hover:underline sm:min-h-9">View all<ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} /></button>
                  </div>
                  {historyQuery.isLoading && <p role="status" className="text-base leading-7 text-[#4B6382]">Loading activity…</p>}
                  {historyQuery.isError && <p role="alert" className="text-base font-semibold leading-7 text-[#B42318]">Unable to load recent activity.</p>}
                  {historyQuery.data && historyChanges.length === 0 && <p className="text-base leading-7 text-[#4B6382]">No activity has been recorded for this document yet.</p>}
                  {historyChanges.length > 0 && <ActivityTimeline changes={historyChanges.slice(-2).reverse()} ariaLabel="Recent document activity" />}
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Participants' && (
          <div className="w-full space-y-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0C2B49]"><GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Manage participants</h2>
            <p className="text-sm text-[#4B6382]">Invite people to this document or update their access.</p>
            <Link href={`/portal/documents/${document.document_id}/participants`} className="inline-flex min-h-11 items-center rounded-full bg-[#0067B3] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Open participant management</Link>
          </div>
        )}

        {activeTab === 'Comments' && (
          draftCommentsPanel
        )}

        {activeTab === 'Files' && (
          <div className="space-y-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0C2B49]"><FolderOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document files</h2>
            <div className="flex flex-wrap gap-2">
              {document.permissions?.can_attach_signed_copy && <button type="button" onClick={openSignedCopyForm} className="rounded-full bg-[#0067B3] px-4 py-2.5 text-sm font-extrabold text-white">Attach signed PDF</button>}
              {document.permissions?.can_replace_signed_copy && <button type="button" onClick={() => { setSignedCopyMode('replace'); setSignedCopyError(null); signedCopyMutation.reset(); }} className="rounded-full border border-[#0067B3] px-4 py-2.5 text-sm font-extrabold text-[#0067B3]">Replace signed PDF</button>}
            </div>
            {signedCopyForm}
            <SignedPdfPreview key={`${document.document_id}:${document.signed_copy?.id ?? 'missing'}`} document={document} />
            {signedCopiesQuery.isLoading && <p role="status" className="text-sm text-[#4B6382]">Loading earlier signed PDFs…</p>}
            {signedCopiesQuery.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load earlier signed PDFs.</p>}
            {earlierSignedCopies.length > 0 && <details className="rounded-xl border border-[#E8F0F8] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#0C2B49]">Earlier signed PDFs ({earlierSignedCopies.length})</summary>
              <div className="mt-4 space-y-3">
                {earlierSignedCopies.map((copy) => <article key={copy.id} className="space-y-2 rounded-xl bg-[#F8FBFF] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-[#0C2B49]">{copy.original_filename ?? 'Signed PDF'}</p>
                    <time dateTime={copy.created_at} className="text-xs font-semibold text-[#4B6382]">{formatDate(copy.created_at)}</time>
                  </div>
                  {copy.replaced_reason && <p className="text-sm text-[#4B6382]">Reason replaced: {copy.replaced_reason}</p>}
                  <details className="text-sm text-[#4B6382]">
                    <summary className="cursor-pointer font-semibold">File details</summary>
                    <div className="mt-2 space-y-2">
                      <p>{copy.content_type} · {copy.size_bytes.toLocaleString()} bytes</p>
                      <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">SHA-256</span><CopyableIdentifier value={copy.sha256} label="signed PDF hash" /></div>
                    </div>
                  </details>
                  <div className="flex flex-wrap gap-3">
                    <a href={signedCopyFileUrl(document.document_id, { copyId: copy.id })} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#0067B3]">Open earlier PDF</a>
                    <a href={signedCopyFileUrl(document.document_id, { copyId: copy.id, download: true, filename: copy.original_filename ?? undefined })} className="text-sm font-bold text-[#0C2B49]">Download earlier PDF</a>
                  </div>
                </article>)}
              </div>
            </details>}
          </div>
        )}



        {activeTab === 'Blockchain' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <AccountTreeIcon aria-hidden="true" sx={{ fontSize: 24, color: '#0067B3', mt: '2px' }} />
              <div>
                <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0C2B49]"><AccountTreeIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Blockchain record</h2>
                <p className="mt-1 text-sm leading-6 text-[#4B6382]">When this document is finalized, its digital fingerprint is saved to the blockchain. Comparing fingerprints can show whether the saved PDF has changed.</p>
              </div>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-[#4B6382]">Record status</dt><dd className="mt-1 text-[#0C2B49]">{anchorLabel(document.lifecycle, document.on_chain)}</dd></div>
              {document.document_hash && <div><dt className="font-bold text-[#4B6382]">Document fingerprint (hash)</dt><dd className="mt-1 text-[#0C2B49]"><CopyableIdentifier value={document.document_hash} label="document hash" /></dd></div>}
              {document.on_chain && <div><dt className="font-bold text-[#4B6382]">Recorded</dt><dd className="mt-1 text-[#0C2B49]">{formatDate(document.finalized_at)}</dd></div>}
            </dl>
          </div>
        )}

        {activeTab === 'Activity' && (
          <section aria-labelledby="document-activity-heading" className="space-y-4 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
            <div><h2 id="document-activity-heading" className={overviewSectionHeadingClassName}><HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document activity</h2><p className="mt-1 text-sm leading-5 text-[#4B6382]">Important changes to this document, from oldest to newest.</p></div>
            {historyQuery.isLoading && <p role="status" className="text-base leading-7 text-[#4B6382]">Loading activity…</p>}
            {historyQuery.isError && <p role="alert" className="text-base font-semibold leading-7 text-[#B42318]">Unable to load document activity.</p>}
            {historyQuery.data && historyChanges.length === 0 && <p className="text-base leading-7 text-[#4B6382]">No activity has been recorded for this document yet.</p>}
            {historyChanges.length > 0 && <ActivityTimeline changes={historyChanges} ariaLabel="Document activity" showActor />}
          </section>
        )}

      </div>
        </>
      )}
    </section>
  );
}
