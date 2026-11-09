'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { toast } from 'sonner';
import { portalRequest } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types/index';
import { attachSignedCopy, correctDocumentEntry, LifecycleRequestError, listDocumentHistory, listDraftComments, listSignedCopies, replaceSignedCopy, signedCopyFileUrl, syncDraftComments } from '@/features/documents/document-lifecycle-api';
import { isGoogleDraftUrl } from '@/features/documents/document-draft-api';
import { getDocumentLifecycleLabel } from '@/features/documents/document-ui';
import { shortenIntegrityHash, verifyRepositoryDocument } from '@/features/verification';
import { getBaseSepoliaTransactionUrl } from '@/features/verification/integrity-ui';
import { isMockMode } from '@/lib/mocks/mode';
import { GoogleDraftPanel } from '@/features/documents/components/google-draft-panel';
import { DocumentProgress } from '@/features/documents/components/document-progress';
import { UploadPolicyNotice } from '@/features/documents/components/upload-policy-notice';
import { listDocumentParties, type PortalUiRole } from '@/features/access';
import { DocumentEcopyRequestHistory } from '@/features/access/components/document-ecopy-request-history';
import { listRegisterBooks } from '@/features/office/books-api';
import { latestRegisterBook } from '@/features/office/latest-register-book';
import { PortalDropdown } from '@/features/portal/components';
import { Checkbox, EmptyState } from '@/shared/components/ui';
import { usePopup } from '@/shared/components/ui/use-popup';
import { getRegisterEntryError, getUploadFileError } from '@/features/documents/portal-upload';
import { createWatermarkedSignedPdf } from '@/features/documents/watermark-signed-pdf';
import { DocumentParticipantManagement } from '@/features/documents/components/document-participant-management';
import { Modal } from '@/features/admin/components/modal';

type WorkspaceDocument = ApiSchema<'DocumentResponse'>;

const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p role="status" className="p-4 text-sm text-[#4B6382]">Loading PDF viewer…</p>,
});

const tabs = ['Overview', 'Files', 'Comments', 'Participants', 'Blockchain', 'History'] as const;
export type Tab = typeof tabs[number];
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FinalizationNextStep({ document, role, outcomeUnknown }: {
  document: WorkspaceDocument;
  role: PortalUiRole;
  outcomeUnknown: boolean;
}) {
  const status = document.status?.trim().toUpperCase();
  const heading = outcomeUnknown
    ? 'Check finalization status'
    : status === 'AWAITING_REVIEW' || status === 'READY_FOR_REVIEW'
      ? role === 'lawyer' ? 'Review extracted text' : 'Waiting for text review'
      : status === 'FAILED'
        ? 'Processing failed'
        : status === 'QUEUED'
          ? 'Waiting to start'
          : status === 'PROCESSING' ? 'Extracting text' : status === 'ENRICHING' ? 'Analyzing document'
    : document.permissions.can_finalize
      ? 'Check the signed PDF'
      : 'Waiting for finalization';
  const guidance = outcomeUnknown
    ? 'The result is not confirmed. Check the status message above before trying again.'
    : status === 'AWAITING_REVIEW' || status === 'READY_FOR_REVIEW'
      ? role === 'lawyer' ? 'Review and approve the extracted text before analysis.' : 'Your lawyer will review the extracted text.'
      : status === 'FAILED'
        ? document.permissions.can_retry_processing ? 'Retry processing to continue.' : 'The document owner can retry processing.'
        : status === 'QUEUED'
          ? 'Your signed PDF is waiting for processing to start. This page checks for updates automatically.'
          : status === 'PROCESSING' ? 'Text extraction is in progress. This page checks for updates automatically.'
            : status === 'ENRICHING' ? 'Analysis is in progress. This page checks for updates automatically.'
    : document.permissions.can_finalize
      ? document.permissions.can_replace_signed_copy
        ? 'Review the PDF and risk findings. You can replace it before finalizing.'
        : 'Review the PDF and risk findings before finalizing.'
      : role === 'lawyer'
        ? 'The document owner will finalize the signed PDF.'
        : 'Your lawyer will finalize the signed PDF.';

  return (
    <div role="status" aria-live="polite" aria-labelledby="finalization-next-step-heading">
      <h3 id="finalization-next-step-heading" className="text-sm font-bold text-[#0C2B49]">{heading}</h3>
      <p className="mt-1 text-sm leading-5 text-[#4B6382]">{guidance}</p>
    </div>
  );
}

function HistoryTimeline({
  changes,
  ariaLabel,
  showActor = false,
}: {
  changes: ApiSchema<'StageChangeResponse'>[];
  ariaLabel: string;
  showActor?: boolean;
}) {
  return (
    <ol aria-label={ariaLabel} className="ml-1 border-l-2 border-[#D7E4F2]">
      {changes.map((change, index) => (
        <li
          key={`${change.created_at}-${change.action}-${index}`}
          className="relative pb-5 pl-5 last:pb-1"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0067B3] shadow-sm"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="min-w-0 font-bold text-sm leading-5 text-[#0C2B49]">
              {getDocumentLifecycleLabel(change.action)}
            </p>
            <time dateTime={change.created_at} className="shrink-0 text-xs font-medium text-[#4B6382]">
              {formatDate(change.created_at)}
            </time>
          </div>
          <p className="mt-0.5 min-w-0 text-xs leading-5 text-[#4B6382]">
            {change.from_stage
              ? `Stage changed from ${getDocumentLifecycleLabel(change.from_stage)} to ${getDocumentLifecycleLabel(change.to_stage)}`
              : `Stage set to ${getDocumentLifecycleLabel(change.to_stage)}`}
          </p>
          {showActor && change.actor_id && (
            <details className="mt-1.5 text-xs text-[#4B6382]">
              <summary className="cursor-pointer font-semibold text-[#0067B3] hover:underline focus-visible:outline-2 focus-visible:outline-[#0067B3]">
                Show actor ID
              </summary>
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-[#F8FBFF] p-2 border border-[#E8F0F8]">
                <span className="font-medium text-[#4B6382]">Actor ID:</span>
                <CopyableIdentifier value={change.actor_id} label="actor ID" />
              </div>
            </details>
          )}
        </li>
      ))}
    </ol>
  );
}

function participantName(party: ApiSchema<'DocumentPartyResponse'>) {
  return [party.f_name, party.l_name].filter(Boolean).join(' ') || party.email;
}

function participantRole(party: ApiSchema<'DocumentPartyResponse'>) {
  if (party.role === 'owner') return 'Lawyer';
  const role = ({ viewer: 'Viewer', signer: 'Signer', editor: 'Editor' } as Record<string, string>)[party.role];
  if (party.user_id === null) {
    if (party.status === 'expired') return [role ?? 'Participant', 'Invitation expired'].filter(Boolean).join(' · ');
    return [role ?? 'Participant', 'Waiting for sign-up'].filter(Boolean).join(' · ');
  }
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
  onManage,
}: {
  documentId: string;
  canManage: boolean;
  isLoading: boolean;
  isError: boolean;
  people: ApiSchema<'DocumentPartyResponse'>[];
  onRetry: () => void;
  onManage?: () => void;
}) {
  return (
    <section aria-labelledby="participants-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
          <h2 id="participants-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">Participants</h2>
          {people.length > 0 && (
            <span className="rounded-full bg-[#F4F8FC] border border-[#E8F0F8] px-2.5 py-0.5 text-xs font-semibold text-[#4B6382]">
              {people.length}
            </span>
          )}
        </div>
        {canManage && (
          <Link
            href={`/portal/documents/${documentId}/participants`}
            onClick={onManage ? (e) => { e.preventDefault(); onManage(); } : undefined}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
          >
            <ManageAccountsOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />
            Manage
          </Link>
        )}
      </div>
      {isLoading && <p role="status" className="mt-3 text-sm leading-6 text-[#4B6382]">Loading participants…</p>}
      {isError && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p role="alert" className="text-sm font-semibold text-[#B42318]">Unable to load participants.</p>
          <button type="button" onClick={onRetry} className="min-h-11 rounded-full border border-[#D7E4F2] px-3.5 py-1.5 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Retry participants</button>
        </div>
      )}
      {!isLoading && !isError && people.length === 0 && (
        <EmptyState
          className="mt-3"
          icon={<GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
          title="No participants listed yet"
          description="When parties are added to this document, their roles and details will appear here."
        />
      )}
      {people.length > 0 && (
        <ul aria-label="Participants" className="mt-3 divide-y divide-[#E8F0F8]">
          {people.map((person) => {
            const name = participantName(person);
            const initial = name ? name.charAt(0).toUpperCase() : '?';
            return (
              <li
                key={person.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-2.5"
                title={`${name} · ${participantRole(person)}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF4FF] text-xs font-bold text-[#0067B3]">
                    {initial}
                  </span>
                  <span className="text-sm font-medium text-[#0C2B49]">{name}</span>
                </div>
                <span className="rounded-full bg-[#F4F8FC] border border-[#E8F0F8] px-2.5 py-0.5 text-xs text-[#4B6382]">
                  {participantRole(person)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
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
    <section aria-labelledby="draft-comments-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CommentOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
          <h2 id="draft-comments-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">Draft comments</h2>
          {comments && (
            <span className="rounded-full bg-[#F4F8FC] border border-[#E8F0F8] px-2.5 py-0.5 text-xs font-semibold text-[#4B6382]">
              {comments.unresolved} unresolved · Last checked {formatDate(comments.synced_at)}
            </span>
          )}
        </div>
        {document.lifecycle === 'PREPARING' && document.permissions.can_mark_ready && (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#0067B3] px-4 py-2 text-sm font-bold text-[#0067B3] hover:bg-[#EEF6FF] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
          >
            <SyncOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Refreshing comments…' : 'Refresh comments'}
          </button>
        )}
      </div>

      <p className="sr-only">
        {document.lifecycle === 'PREPARING' ? 'Saved comments refresh periodically. Use Refresh comments to check Google Docs now.' : 'Comments are no longer checked automatically after the draft is marked ready for signature.'}
      </p>
      {document.lifecycle === 'PREPARING' && role === 'user' && (
        <p className="sr-only">
          Leave feedback with comments (select text, then choose the comment button), not by editing the document. Google Docs suggestions are not shown here.
        </p>
      )}
      {document.lifecycle === 'PREPARING' && role === 'lawyer' && document.permissions.can_mark_ready && (
        <p className="sr-only">
          Resolve comments and pending Google Docs suggestions before marking the draft ready. Afterward, clients can read the draft but cannot comment. Reopen it if revisions are needed.
        </p>
      )}

      {isLoading && <p role="status" className="mt-3 text-sm leading-6 text-[#4B6382]">Loading comments…</p>}
      {isError && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p role="alert" className="text-sm font-semibold text-[#B42318]">Unable to load draft comments.</p>
          <button type="button" onClick={onRetry} className="min-h-11 rounded-full border border-[#D7E4F2] px-3.5 py-1.5 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Retry comments</button>
        </div>
      )}
      {syncError && <p role="alert" className="mt-3 text-sm font-semibold text-[#B42318]">{syncError.message || 'Unable to refresh comments.'}</p>}

      {comments && (
        <div className="mt-3 space-y-3">
          {comments.comments.length === 0 ? (
            <EmptyState
              icon={<CommentOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
              title="No comments found in the draft."
              description="Comments and suggestions added in the draft will appear here."
            />
          ) : (
            comments.comments.map((comment) => (
              <article key={comment.id} className="max-w-4xl space-y-2 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold text-[#0C2B49]">{comment.author_name || 'Draft commenter'}</p>
                  <span className="shrink-0 text-xs font-semibold text-[#4B6382]">{comment.resolved ? 'Resolved' : 'Unresolved'}</span>
                </div>
                {comment.quoted_text && <blockquote className="break-words border-l-2 border-[#0067B3] pl-2.5 text-xs leading-5 text-[#4B6382]">{comment.quoted_text}</blockquote>}
                <p className="break-words whitespace-pre-wrap text-sm leading-6 text-[#0C2B49]">{comment.content}</p>
                {comment.replies?.map((reply, index) => (
                  <div key={`${comment.id}-reply-${index}`} className="ml-3 border-l border-[#D6E3F1] pl-3">
                    <p className="text-xs font-bold leading-5 text-[#4B6382]">{reply.author_name || 'Reply'}{reply.action === 'resolve' ? ' · Resolved thread' : reply.action === 'reopen' ? ' · Reopened thread' : ''}</p>
                    <p className="break-words whitespace-pre-wrap text-sm leading-6 text-[#0C2B49]">{reply.content}</p>
                  </div>
                ))}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function InsightGroup({ title, items }: { title: string; items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
    <section>
      <h3 className="text-sm font-bold text-[#0C2B49]">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((item, index) => <li key={index} className="text-base leading-6 text-[#0C2B49]">{readable(item)}</li>)}
      </ul>
    </section>
  );
}

function EntityGroups({ entities }: { entities?: unknown[] | null }) {
  const names: Record<string, string> = { PERSON: 'Persons', ORG: 'Organizations', DATE: 'Dates', MONETARY: 'Amounts', LOCATION: 'Locations', URL: 'URLs', DOCUMENT_NUMBER: 'Document numbers', DOCUMENT_REFERENCE: 'Document references' };
  const groups = new Map<string, unknown[]>();
  for (const entity of entities ?? []) {
    const value = typeof entity === 'object' && entity !== null && !Array.isArray(entity) ? Object.entries(entity) : [];
    const type = value.find(([key]) => key === 'type')?.[1];
    const content = value.find(([key]) => key === 'value')?.[1];
    const title = value.length === 2 && typeof type === 'string' && typeof content === 'string' ? names[type.trim().toUpperCase()] : undefined;
    const group = title ?? 'Other';
    groups.set(group, [...(groups.get(group) ?? []), title ? content : entity]);
  }
  return <>{Array.from(groups, ([title, items]) => <InsightGroup key={title} title={title} items={items} />)}</>;
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

function SignedPdfPreview({
  document,
  role,
  onOpenReplace,
  onOpenAttach,
  signedCopyForm,
  showEcopyHistory = true,
}: {
  document: WorkspaceDocument;
  role: PortalUiRole;
  onOpenReplace?: () => void;
  onOpenAttach?: () => void;
  signedCopyForm?: React.ReactNode;
  showEcopyHistory?: boolean;
}) {
  const queryClient = useQueryClient();
  const requestCopy = useMutation({
    mutationFn: () => portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(`/documents/${encodeURIComponent(document.document_id)}/ecopy-requests`)}`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['ecopy-requests'] }); void queryClient.invalidateQueries({ queryKey: ['portal-doc', document.document_id] }); },
  });
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

  const { open: downloadMenuOpen, setOpen: setDownloadMenuOpen, ref: downloadMenuRef } = usePopup();

  function openPdfViewer() {
    setPdfLoading(true);
    setPdfViewerOpen(true);
  }

  return (
    <section aria-labelledby="signed-pdf-preview-heading" className="flex min-w-0 flex-col rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="signed-pdf-preview-heading" className="inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]"><PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Signed PDF</h2>
            {signedCopy && <span className="rounded-full bg-[#E7F5EC] px-2.5 py-0.5 text-xs font-bold text-[#067647]">Current</span>}
            {document.lifecycle === 'FINALIZED' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F4F8] px-2.5 py-0.5 text-xs font-bold text-[#344054]">
                <LockOutlinedIcon aria-hidden="true" sx={{ fontSize: 13, color: '#0067B3' }} />
                Finalized (locked)
              </span>
            )}
          </div>
          {signedCopy && <p className="mt-1 break-words text-sm leading-5 text-[#4B6382]"><span className="font-semibold text-[#0C2B49]">{signedCopy.original_filename ?? document.file_name}</span>{typeof signedCopy.size_bytes === 'number' ? ` · ${formatFileSize(signedCopy.size_bytes)}` : ''}{signedCopy.created_at ? ` · Attached ${formatDate(signedCopy.created_at)}` : ''}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {document.lifecycle === 'SIGNED' && document.permissions?.can_replace_signed_copy && onOpenReplace && (
            <button
              type="button"
              onClick={onOpenReplace}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#0067B3] px-3.5 py-2 text-sm font-extrabold text-[#0067B3] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
            >
              Replace signed PDF
            </button>
          )}
          {signedCopy && (
            <>
              <button
                type="button"
                id="open-signed-pdf"
                aria-haspopup="dialog"
                aria-controls="signed-pdf-viewer-dialog"
                onClick={openPdfViewer}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0673C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
              >
                <PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />
                View PDF
              </button>
              <div ref={downloadMenuRef} className="relative">
                <button
                  type="button"
                  aria-label="Download options"
                  aria-expanded={downloadMenuOpen}
                  aria-controls="signed-pdf-download-menu"
                  onClick={() => setDownloadMenuOpen((open) => !open)}
                  className="grid min-h-10 min-w-10 place-items-center rounded-full border border-[#D7E4F2] text-[#0C2B49] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
                >
                  <MoreVertIcon aria-hidden="true" sx={{ fontSize: 20 }} />
                </button>
                {downloadMenuOpen && (
                  <div
                    id="signed-pdf-download-menu"
                    role="menu"
                    aria-label="Download options"
                    className="absolute right-0 top-full z-50 mt-1 min-w-56 overflow-hidden rounded-xl border border-[#D7E4F2] bg-white p-1.5 shadow-lg shadow-[#183B6B]/10"
                  >
                    <a
                      role="menuitem"
                      aria-label="Download original signed PDF"
                      href={signedCopyFileUrl(document.document_id, {
                        copyId: signedCopy.id,
                        download: true,
                        filename: signedCopy.original_filename ?? document.file_name ?? undefined,
                      })}
                      onClick={() => setDownloadMenuOpen(false)}
                      className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#0C2B49] hover:bg-[#EAF4FF]"
                    >
                      <DownloadOutlinedIcon aria-hidden="true" sx={{ fontSize: 18, color: '#0067B3' }} />
                      <span>Download original PDF <span className="text-xs font-normal text-[#4B6382]">(SHA-256)</span></span>
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={watermarkedCopyStatus === 'preparing' ? 'Preparing copy…' : 'Download PDF Copy'}
                      disabled={watermarkedCopyStatus === 'preparing'}
                      onClick={() => {
                        void downloadWatermarkedCopy();
                      }}
                      className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#0C2B49] hover:bg-[#EAF4FF] disabled:opacity-50"
                    >
                      <DownloadOutlinedIcon aria-hidden="true" sx={{ fontSize: 18, color: '#0067B3' }} />
                      {watermarkedCopyStatus === 'preparing' ? (
                        'Preparing copy…'
                      ) : (
                        <span>Download PDF Copy <span className="text-xs font-normal text-[#4B6382]">(Watermarked)</span></span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {document.permissions?.can_attach_signed_copy && !signedCopy && onOpenAttach && (
            <button
              type="button"
              onClick={onOpenAttach}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#0673C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
            >
              Attach signed PDF
            </button>
          )}
        </div>
      </div>

      {!signedCopy && (
        <p className="mt-4 rounded-lg bg-[#F8FBFF] p-4 text-base leading-7 text-[#4B6382]">No signed PDF is attached to this document yet.</p>
      )}

      {(watermarkedCopyStatus === 'failed' || watermarkedCopyStatus === 'downloaded') && (
        <p aria-live="polite" className="mt-2 text-xs leading-5 text-[#4B6382]">
          {watermarkedCopyStatus === 'failed'
            ? 'Could not create the watermarked copy. The signed original is unchanged.'
            : 'Watermarked PDF copy downloaded. The signed original remains unchanged for integrity checks.'}
        </p>
      )}

      {signedCopyForm}

      {role === 'user' && document.lifecycle === 'FINALIZED' && (
        <div className="mt-5 border-t border-[#D7E4F2] pt-4">
          {document.permissions.can_request_ecopy && (
            <button
              type="button"
              disabled={requestCopy.isPending || requestCopy.isSuccess}
              onClick={() => requestCopy.mutate()}
              className="min-h-11 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#0673C4] disabled:opacity-60"
            >
              {requestCopy.isPending ? 'Requesting…' : requestCopy.isSuccess ? 'E-copy requested' : 'Request e-copy'}
            </button>
          )}
          {requestCopy.isError && (
            <p role="alert" className="mt-2 text-sm text-[#B42318]">
              {requestCopy.error instanceof Error ? requestCopy.error.message : 'Could not request the e-copy.'}
            </p>
          )}
          <p className="mt-2 text-sm text-[#4B6382]">
            <Link href="/portal/requests/my" className="font-semibold text-[#0067B3] hover:underline">
              View e-copy requests and approved downloads
            </Link>
          </p>
        </div>
      )}

      {document.lifecycle === 'FINALIZED' && showEcopyHistory && (
        <DocumentEcopyRequestHistory documentId={document.document_id} showDeliveryError={role === 'lawyer'} />
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
  initialTab?: string;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  finalizationResult?: ApiSchema<'RecordResponse'>;
  readinessError?: Error | null;
  isChangingReadiness?: boolean;
  finalizationOutcomeUnknown?: boolean;
  isConfirmingFinalization?: boolean;
  workflowActions?: ReactNode;
  onMarkReady?: () => void;
  onReopen?: () => void;
  onDocumentUpdated?: (document: WorkspaceDocument) => void;
};

export function DocumentWorkspace({
  className,
  document,
  role = 'user',
  initialTab,
  activeTab: activeTabProp,
  onTabChange,
  finalizationResult,
  readinessError,
  isChangingReadiness = false,
  finalizationOutcomeUnknown = false,
  isConfirmingFinalization = false,
  workflowActions,
  onMarkReady,
  onReopen,
  onDocumentUpdated = () => undefined,
}: DocumentWorkspaceProps) {
  const requestedTab = tabs.find((tab) => tab.toLowerCase() === initialTab?.toLowerCase());
  const isDrafting = document.lifecycle === 'PREPARING' || document.lifecycle === 'READY_FOR_SIGNATURE';
  const progressPath = document.draft_url ? 'google' : 'pdf';
  const status = document.status?.trim().toUpperCase();
  const signedPdfReviewIdentity = `${document.document_id}:${document.signed_copy?.id ?? 'missing'}`;
  const signedPdfReviewKey = document.signed_copy?.id ? `lexchain:reviewed-signed-pdf:${signedPdfReviewIdentity}` : null;
  const [reviewedSignedPdfKey, setReviewedSignedPdfKey] = useState<string | null>(null);
  const storedSignedPdfReview = useSyncExternalStore(
    (notify) => { window.addEventListener('storage', notify); return () => window.removeEventListener('storage', notify); },
    () => { try { return signedPdfReviewKey !== null && localStorage.getItem(signedPdfReviewKey) === '1'; } catch { return false; } },
    () => false,
  );
  const hasReviewedSignedPdf = storedSignedPdfReview || reviewedSignedPdfKey === signedPdfReviewIdentity;
  const continueToTextReview = () => {
    setReviewedSignedPdfKey(signedPdfReviewIdentity);
    try { if (signedPdfReviewKey) localStorage.setItem(signedPdfReviewKey, '1'); } catch { /* Storage may be unavailable. */ }
  };
  const isReviewingText = ['AWAITING_REVIEW', 'READY_FOR_REVIEW', 'ENRICHING', 'COMPLETED'].includes(status ?? '');
  const needsSignedPdfReview = role === 'lawyer' && document.lifecycle === 'SIGNED' && progressPath === 'pdf' && ['AWAITING_REVIEW', 'READY_FOR_REVIEW'].includes(status ?? '') && !hasReviewedSignedPdf && !isConfirmingFinalization && !finalizationOutcomeUnknown;
  const isProcessing = ['QUEUED', 'PROCESSING', 'ENRICHING'].includes(status ?? '');
  const showWorkflowStatus = document.lifecycle === 'SIGNED' || (document.lifecycle === 'FINALIZED' && (isProcessing || ['FAILED', 'AWAITING_REVIEW', 'READY_FOR_REVIEW'].includes(status ?? '')));
  const signedProgressStep = (progressPath === 'google' ? 3 : 2) + (document.lifecycle === 'FINALIZED' || isConfirmingFinalization ? 2 : isReviewingText && !needsSignedPdfReview ? 1 : 0);
  const showAnalysis = document.lifecycle !== 'SIGNED' || document.status?.trim().toUpperCase() === 'COMPLETED';
  const canManageParticipants = role === 'lawyer' && (document.permissions.can_share || document.permissions.can_revoke);
  const visibleTabs = tabs.filter((tab) => (tab !== 'Comments' || (document.lifecycle !== 'FINALIZED' && Boolean(document.draft_url))) && (tab !== 'Participants' || isDrafting || canManageParticipants) && (tab !== 'Blockchain' || !isDrafting));
  const [internalActiveTab, setInternalActiveTab] = useState<Tab>(requestedTab && visibleTabs.includes(requestedTab) ? requestedTab : 'Overview');
  const showTabs = document.lifecycle === 'FINALIZED';
  const selectedTab = activeTabProp ?? internalActiveTab;
  const activeTab = showTabs && visibleTabs.includes(selectedTab) ? selectedTab : 'Overview';
  const hasGoogleDraft = isGoogleDraftUrl(document.draft_url ?? '');
  const isInlineAttach = isDrafting && document.lifecycle === 'READY_FOR_SIGNATURE' && Boolean(document.permissions?.can_attach_signed_copy);
  const [signedCopyMode, setSignedCopyMode] = useState<'attach' | 'replace' | null>(null);
  const activeSignedCopyMode = signedCopyMode ?? (isInlineAttach ? 'attach' : null);
  const signedCopyFileInput = useRef<HTMLInputElement>(null);
  const [signedCopyFile, setSignedCopyFile] = useState<File | null>(null);
  const [signedCopyDragOver, setSignedCopyDragOver] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');
  const [chosenSignedCopyBookId, setSignedCopyBookId] = useState(document.book_id ?? '');
  const [enterPaperNumbers, setEnterPaperNumbers] = useState(false);
  const [signedCopyError, setSignedCopyError] = useState<string | null>(null);
  const [reviewedSuggestionsFor, setReviewedSuggestionsFor] = useState<string | null>(null);
  const [correctingEntry, setCorrectingEntry] = useState(false);
  const { open: summaryActionsOpen, setOpen: setSummaryActionsOpen, ref: summaryActionsRef } = usePopup();
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
    enabled: (!isDrafting && activeTab === 'Overview' && role === 'lawyer' && Boolean(document.book_id)) || (correctingEntry && canCorrectEntry) || activeSignedCopyMode === 'attach',
    retry: false,
    refetchInterval: 15_000,
  });
  const signedCopyBookId = chosenSignedCopyBookId || latestRegisterBook(registerBooksQuery.data ?? [])?.id || '';
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
  const chainQuery = useQuery({
    queryKey: ['portal-doc-chain', document.document_id],
    queryFn: () => verifyRepositoryDocument(document.document_id),
    enabled: activeTab === 'Blockchain' && Boolean(document.on_chain || document.lifecycle === 'FINALIZED') && !isMockMode(),
    retry: false,
  });
  const txHash = chainQuery.data?.tx_hash || finalizationResult?.tx_hash;
  const transactionUrl = txHash ? getBaseSepoliaTransactionUrl(txHash) : null;
  const signedCopiesQuery = useQuery({ queryKey: ['portal-doc-signed-copies', document.document_id], queryFn: () => listSignedCopies(document.document_id), enabled: !isDrafting && (activeTab === 'Files' || !showTabs), refetchInterval: 15_000 });
  const partiesQuery = useQuery({
    queryKey: ['portal-document-parties', document.document_id],
    queryFn: () => listDocumentParties(document.document_id),
    enabled: isDrafting || activeTab === 'Overview' || activeTab === 'Participants',
    retry: false,
    refetchInterval: 15_000,
  });
  const historyQuery = useQuery({
    queryKey: ['portal-document-history', document.document_id],
    queryFn: () => listDocumentHistory(document.document_id),
    enabled: activeTab === 'History' || (!isDrafting && activeTab === 'Overview'),
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
  function selectTab(tab: Tab) {
    if (activeTabProp === undefined) {
      setInternalActiveTab(tab);
    }
    onTabChange?.(tab);
  }

  useEffect(() => {
    if (activeSignedCopyMode) signedCopyFileInput.current?.focus({ preventScroll: activeSignedCopyMode === 'attach' });
  }, [activeSignedCopyMode]);
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
    onManage={showTabs && visibleTabs.includes('Participants') ? () => selectTab('Participants') : undefined}
  />;

  function openEntryCorrection() {
    setEntryBookId(document.book_id ?? '');
    setEntryDocNo(document.doc_no == null ? '' : String(document.doc_no));
    setEntryPageNo(document.page_no == null ? '' : String(document.page_no));
    setEntryCorrectionValidationError(null);
    correctEntryMutation.reset();
    setCorrectingEntry(true);
  }

  function closeEntryCorrection() {
    if (correctEntryMutation.isPending) return;
    setCorrectingEntry(false);
    setEntryCorrectionValidationError(null);
    correctEntryMutation.reset();
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
    if (showTabs) selectTab('Files');
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
    const mode = activeSignedCopyMode;
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

  const signedPdfCard = (
    <section aria-labelledby="signed-pdf-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <PictureAsPdfOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
        <h2 id="signed-pdf-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">Signed PDF</h2>
      </div>
      <p className="mt-1 text-sm text-[#5B6F8A]">Upload the signed PDF, including any required notary stamp and register details.</p>
      <div className="mt-4 border-t border-[#E8F0F8] pt-4 space-y-4">
        <div className="space-y-2">
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
        {signedCopyError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyError}</p>}
        {signedCopyMutation.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyMutation.error instanceof Error ? signedCopyMutation.error.message : 'Upload failed.'} Your selected file and filing details have been kept. Review the error and retry.</p>}
      </div>
    </section>
  );

  function closeSignedCopyForm() {
    if (signedCopyMutation.isPending) return;
    setSignedCopyMode(null);
    setSignedCopyFile(null);
    setReplacementReason('');
    setSignedCopyError(null);
    signedCopyMutation.reset();
  }

  const signedCopyForm = activeSignedCopyMode && !isInlineAttach && <form aria-labelledby="signed-copy-form-heading" className="space-y-3 border-t border-[#E8F0F8] py-4" onSubmit={submitSignedCopy}>
    {activeSignedCopyMode === 'attach' && <div>
      <h3 className="text-base font-bold text-[#0C2B49]">Attach the signed PDF to this record</h3>
      <p className="mt-1 max-w-2xl text-sm leading-5 text-[#4B6382]">Upload the signed PDF, including any required notary stamp. It will be added to this same document record with its register details.</p>
    </div>}
    <div className="space-y-2">
      <p id="signed-copy-form-heading" className="text-sm font-bold text-[#0C2B49]">Upload signed document</p>
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
    {activeSignedCopyMode === 'replace' && <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Replacement reason<textarea aria-label="Replacement reason" required value={replacementReason} disabled={signedCopyMutation.isPending} onChange={(event) => setReplacementReason(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" /></label>}
    <UploadPolicyNotice />
    {signedCopyError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyError}</p>}
    {signedCopyMutation.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyMutation.error instanceof Error ? signedCopyMutation.error.message : 'Upload failed.'} Your selected file and {activeSignedCopyMode === 'attach' ? 'filing details' : 'replacement reason'} have been kept. Review the error and retry.</p>}
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        disabled={!signedCopyFile || (activeSignedCopyMode === 'replace' && !replacementReason.trim()) || signedCopyMutation.isPending}
        className="min-h-11 rounded-full bg-[#0673C4] px-4 py-2 text-sm font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50"
      >
        {signedCopyMutation.isPending ? 'Uploading…' : activeSignedCopyMode === 'replace' ? 'Confirm replacement' : 'Confirm attachment'}
      </button>
      <button
        type="button"
        disabled={signedCopyMutation.isPending}
        onClick={closeSignedCopyForm}
        className="min-h-11 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
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
        ? null
        : 'Review the Google Doc and leave feedback in its comments. Your lawyer will mark it ready when the text is settled.'
    : role === 'lawyer'
      ? 'The document owner will attach the signed PDF to this record after signing.'
      : 'Your lawyer is arranging signatures outside LexChain and will add the signed PDF to this same record.';
  const nextStepPanel = document.lifecycle === 'READY_FOR_SIGNATURE' ? (
    <section aria-labelledby="next-step-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
      {isInlineAttach && <UploadPolicyNotice />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
          <h2 id="next-step-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">{nextStepHeading}</h2>
        </div>
        {!isInlineAttach && nextStepGuidance && (
          <p className="text-sm text-[#5B6F8A]">{nextStepGuidance}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {document.permissions.can_reopen && (
            <button
              type="button"
              onClick={() => { setReviewedSuggestionsFor(null); onReopen?.(); }}
              disabled={isChangingReadiness || signedCopyMutation.isPending}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#D7E4F2] bg-white px-4 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#EEF4FB] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
            >
              <ArrowBackIcon aria-hidden="true" sx={{ fontSize: 18 }} />
              Back
            </button>
          )}
          {isInlineAttach && (
            <button
              type="submit"
              disabled={!signedCopyFile || !selectedSignedCopyBook || signedCopyMutation.isPending}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50"
            >
              <CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 18 }} />
              {signedCopyMutation.isPending ? 'Uploading…' : 'Confirm attachment'}
            </button>
          )}
        </div>
      </div>
    </section>
  ) : (
    <section aria-labelledby="next-step-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
          <h2 id="next-step-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">{nextStepHeading}</h2>
        </div>
        {document.lifecycle === 'PREPARING' && hasGoogleDraft && unresolvedCommentCount === 0 && !commentsQuery.isLoading && !commentsQuery.isError && !syncComments.isPending && !syncComments.isError && (
          <span role="status" className="inline-flex items-center gap-1.5 rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#067647]">
            <CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 16, color: '#067647' }} />
            All comments are resolved.
          </span>
        )}
      </div>
      {nextStepGuidance && <p className="mt-1 text-sm text-[#5B6F8A]">{nextStepGuidance}</p>}
      {document.lifecycle === 'PREPARING' && readinessError && <div role="alert" className="mt-4 space-y-2 rounded-lg bg-red-50 p-4 text-base font-bold leading-7 text-[#B42318]">
        <p>{readinessError.message}</p>
        {readinessError instanceof LifecycleRequestError && readinessError.reason === 'UNRESOLVED_COMMENTS' && <>
          {typeof readinessError.unresolved === 'number' && Number.isInteger(readinessError.unresolved) && readinessError.unresolved >= 0 && <p>{readinessError.unresolved} unresolved comments remain.</p>}
          {typeof readinessError.draftUrl === 'string' && isGoogleDraftUrl(readinessError.draftUrl) && <a className="underline" href={readinessError.draftUrl} target="_blank" rel="noreferrer">Open Google draft to resolve comments</a>}
        </>}
      </div>}

      {document.lifecycle === 'PREPARING' && hasGoogleDraft && document.permissions.can_mark_ready && <div className="mt-4 border-t border-[#E8F0F8] pt-4">
        {commentsQuery.isLoading && <p role="status" className="text-sm text-[#4B6382]">Checking unresolved comments…</p>}
        {commentsQuery.isError && <p role="alert" className="text-sm font-semibold text-[#B42318]">Comments could not be checked. Retry comments above before continuing.</p>}
        {syncComments.isPending && <p role="status" className="text-sm text-[#4B6382]">Refreshing comments…</p>}
        {syncComments.isError && <p role="alert" className="text-sm font-semibold text-[#B42318]">Comments could not be refreshed. Choose Refresh comments above before continuing.</p>}
        {typeof unresolvedCommentCount === 'number' && unresolvedCommentCount > 0 && <p role="status" className="mb-3 text-sm font-semibold text-[#B42318]">Resolve {unresolvedCommentCount} unresolved {unresolvedCommentCount === 1 ? 'comment' : 'comments'} in Google Docs, then refresh comments before marking the draft ready.</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {unresolvedCommentCount === 0 && !commentsQuery.isLoading && !commentsQuery.isError && !syncComments.isPending && !syncComments.isError ? (
            <label className="flex min-h-11 items-center gap-2.5 text-sm font-semibold text-[#0C2B49]">
              <Checkbox checked={suggestionsReviewed} onChange={(event) => setReviewedSuggestionsFor(event.target.checked ? document.document_id : null)} />
              <span>I checked Google Docs and resolved any pending suggestions.</span>
            </label>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onMarkReady}
            disabled={isChangingReadiness || readinessBlocked}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#00528F] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
          >
            <CheckCircleOutlineIcon aria-hidden="true" sx={{ fontSize: 18 }} />
            {isChangingReadiness ? 'Updating…' : 'Mark ready for signature'}
          </button>
        </div>
      </div>}
    </section>
  );

  const historyPanel = (
    <section aria-labelledby="completed-history-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
      <h2 id="completed-history-heading" className={overviewSectionHeadingClassName}><HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />History</h2>
      <div className="mt-4 text-base leading-7 text-[#344054] [&_time]:text-sm [&_li_p]:text-sm">
        {historyQuery.isLoading && <p role="status">Loading history…</p>}
        {historyQuery.isError && <p role="alert">Unable to load history.</p>}
        {historyQuery.data && historyChanges.length === 0 && <EmptyState className="mt-3" icon={<HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />} title="No history recorded" description="No history has been recorded for this document yet." />}
        {historyChanges.length > 0 && <HistoryTimeline changes={[...historyChanges].reverse()} ariaLabel="Document history" showActor />}
      </div>
    </section>
  );

  const isCompletedSigned = document.lifecycle === 'SIGNED' && document.status?.trim().toUpperCase() === 'COMPLETED';
  const isCompletedOverview = isCompletedSigned || (document.lifecycle === 'FINALIZED' && document.status?.trim().toUpperCase() === 'COMPLETED');
  const signedFilesPanel = (
    <div className="space-y-4">
            <SignedPdfPreview
              key={`${document.document_id}:${document.signed_copy?.id ?? 'missing'}`}
              document={document}
              role={role}
              showEcopyHistory={activeTab === 'Files'}
              onOpenReplace={() => {
                setSignedCopyMode('replace');
                setSignedCopyError(null);
                signedCopyMutation.reset();
              }}
              onOpenAttach={openSignedCopyForm}
              signedCopyForm={activeSignedCopyMode === 'replace' ? <Modal open onClose={closeSignedCopyForm} title="Replace signed PDF" size="wide"><div className="max-h-[70dvh] overflow-y-auto">{signedCopyForm}</div></Modal> : signedCopyForm}
            />
            {(!showTabs || activeTab === 'Files') && <>
            {signedCopiesQuery.isLoading && <p role="status" className="text-sm text-[#4B6382]">Loading earlier signed PDFs…</p>}
            {signedCopiesQuery.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load earlier signed PDFs.</p>}
            {earlierSignedCopies.length > 0 && <details className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
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
            </>}
          </div>
  );

  return (
    <section className={`mx-auto flex min-h-0 w-full max-w-7xl flex-col bg-transparent ${isDrafting ? 'overflow-hidden' : ''} ${className ?? ''}`}>
      {showTabs && <div role="tablist" aria-label="Document workspace" className="flex shrink-0 overflow-x-auto border-b border-[#D7E4F2] px-4 sm:px-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => selectTab(tab)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-t-md border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0067B3] ${activeTab === tab ? 'border-[#0067B3] text-[#0C2B49]' : 'border-transparent text-[#4B6382] hover:text-[#0C2B49]'}`}
          >
            {tab === 'Overview' && <DashboardOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab === 'Files' && <FolderOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab === 'Comments' && <CommentOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab === 'Participants' && <GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab === 'Blockchain' && <AccountTreeIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab === 'History' && <HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />}
            {tab}
          </button>
        ))}
      </div>}

      {isDrafting ? (
        <div className="relative mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <header className="sr-only">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#4B6382]">{document.lifecycle === 'PREPARING' ? 'Drafting workspace' : 'Ready for signature'}</p>
            <h2 className="mt-1 text-xl font-bold leading-7 text-[#0C2B49]">{document.lifecycle === 'PREPARING' ? 'Prepare and review the document' : 'Sign the document and return the PDF'}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5B6F8A]">{document.lifecycle === 'PREPARING' ? 'The Google Doc is the working draft. Comments and participants stay with this record while you agree on the text.' : 'Signing happens outside LexChain. Upload the signed PDF here to keep it attached to this same record.'}</p>
          </header>

          {activeTab === 'Overview' && <DocumentProgress path="google" currentStep={document.lifecycle === 'READY_FOR_SIGNATURE' ? 3 : document.draft_url ? 2 : 1} />}

          <div className="mt-6 grid gap-6 pb-6">
            {(activeTab === 'Overview' || activeTab === 'Files') && <section aria-labelledby="working-draft-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
                  <h2 id="working-draft-heading" className="text-lg font-bold leading-6 text-[#0C2B49]">{document.lifecycle === 'PREPARING' ? document.draft_url ? 'Working draft' : 'Set up document' : 'Approved text'}</h2>
                  {hasGoogleDraft && (
                    <span className="rounded-full bg-[#EAF4FF] px-2.5 py-0.5 text-xs font-bold text-[#0067B3]">
                      Google Docs · Linked
                    </span>
                  )}
                </div>
                {document.draft_url && isGoogleDraftUrl(document.draft_url) && (
                  <a
                    href={document.draft_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#0067B3] px-4 py-2 text-sm font-bold text-[#0067B3] hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
                  >
                    <OpenInNewOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />
                    {document.lifecycle === 'READY_FOR_SIGNATURE' ? 'Open approved Google Doc' : 'Open Google draft'}
                  </a>
                )}
              </div>
              {(!hasGoogleDraft || !document.draft_url) && (
                <p className="mt-2 text-sm text-[#5B6F8A]">{document.lifecycle === 'PREPARING'
                  ? document.draft_url ? 'The linked Google Doc needs attention before this draft can be reviewed.' : 'Comments and participants stay with this record.'
                  : 'No Google Doc is linked to this record. Continue with the external signing instructions below.'}</p>
              )}
              <div className={hasGoogleDraft && document.draft_url ? 'mt-1' : 'mt-4'}>
                {document.draft_url || (document.lifecycle === 'PREPARING' && document.permissions.can_create_draft)
                  ? <GoogleDraftPanel key={document.document_id} document={document} onDocumentUpdated={onDocumentUpdated} />
                  : <p role="note" className="text-sm text-[#5B6F8A]">{document.lifecycle === 'PREPARING' ? role === 'lawyer' ? 'A working draft is not linked yet. Ask the document owner to create or link the Google Doc.' : 'Your lawyer is preparing the working draft. It will appear here when available.' : 'No Google Doc is linked to this record. Continue with the external signing instructions below.'}</p>}
              </div>
            </section>}

            {(activeTab === 'Overview' || activeTab === 'Participants') && <div>{participantsPanel}</div>}
            {((activeTab === 'Overview' && document.lifecycle === 'PREPARING') || activeTab === 'Comments') && <div>{draftCommentsPanel}</div>}
            {activeTab === 'Overview' && document.lifecycle === 'PREPARING' && nextStepPanel}
            {activeTab === 'Files' && document.lifecycle === 'PREPARING' && <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6"><h2 className="text-lg font-bold text-[#0C2B49]">Signed PDF</h2><p className="mt-2 text-sm text-[#5B6F8A]">Attach the signed PDF after the document is ready for signing.</p></section>}
            {(activeTab === 'Overview' || activeTab === 'Files') && document.lifecycle === 'READY_FOR_SIGNATURE' && (
              isInlineAttach ? (
                <form id="signed-copy-form" onSubmit={submitSignedCopy} className="flex flex-col gap-6">
                  {signedPdfCard}
                  {nextStepPanel}
                </form>
              ) : (
                nextStepPanel
              )
            )}
            {activeTab === 'History' && <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6"><h2 className="text-lg font-bold text-[#0C2B49]">History</h2>{historyQuery.isLoading && <p role="status">Loading history…</p>}{historyQuery.isError && <p role="alert">Unable to load history.</p>}{historyQuery.data && historyChanges.length === 0 && <EmptyState className="mt-3" icon={<HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />} title="No history recorded" description="No history has been recorded for this document yet." />}{historyChanges.length > 0 && <HistoryTimeline changes={historyChanges} ariaLabel="Document history" showActor />}</section>}
          </div>
        </div>
      ) : (
        <>


      <div role={showTabs ? 'tabpanel' : undefined} className="relative min-h-0 w-full flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {activeTab === 'Overview' && isCompletedOverview && (
          <div className="space-y-6">
            {document.lifecycle === 'SIGNED' && <DocumentProgress path={progressPath} currentStep={signedProgressStep} />}
            {signedFilesPanel}
            <section aria-labelledby="completed-summary-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 id="completed-summary-heading" className={overviewSectionHeadingClassName}><DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document summary</h2>
                {canCorrectEntry && <div ref={summaryActionsRef} className="relative">
                  <button type="button" aria-label="Document summary actions" aria-expanded={summaryActionsOpen} aria-haspopup="menu" onClick={() => setSummaryActionsOpen(!summaryActionsOpen)} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#D7E4F2] text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><MoreVertIcon aria-hidden="true" /></button>
                  {summaryActionsOpen && <div role="menu" className="absolute right-0 z-10 mt-1 min-w-56 rounded-xl border border-[#D7E4F2] bg-white p-1 shadow-lg"><button type="button" role="menuitem" onClick={() => { setSummaryActionsOpen(false); summaryActionsRef.current?.querySelector('button')?.focus(); openEntryCorrection(); }} className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-bold text-[#0C2B49] hover:bg-[#EAF4FF]">Correct register entry</button></div>}
                </div>}
              </div>
              <p className="mt-2 break-words text-base leading-7 text-[#344054]">{document.summary || 'No summary is available for this document yet.'}</p>
              <dl className="mt-3 text-sm text-[#4B6382]"><dt className="font-semibold">Register entry</dt><dd>{registerEntry}</dd></dl>
            </section>
            {participantsPanel}
            <section aria-labelledby="completed-concerns-heading" className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
              <h2 id="completed-concerns-heading" className={overviewSectionHeadingClassName}><WarningAmberOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#B77900' }} />Potential concerns</h2>
              <p className="text-sm text-[#4B6382]">AI review · verify against original</p>
              {document.analysis_status === 'partial' && <p role="alert" className="text-sm font-semibold text-[#785000]">Some sections could not be analyzed. Risk findings may be incomplete.</p>}
              {document.risk_flags?.length ? <RiskFlags items={document.risk_flags} /> : <p className="text-base leading-7 text-[#4B6382]">No review findings are available for this document yet.</p>}
            </section>
            <details className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
              <summary className="min-h-11 cursor-pointer text-lg font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><span role="heading" aria-level={2}>Extracted details</span></summary>
              <div className="mt-3 space-y-3">{hasReviewDetails ? <><InsightGroup title="Labels" items={document.labels} /><EntityGroups entities={document.entities} /></> : <p className="text-base text-[#4B6382]">No extracted details are available yet.</p>}</div>
            </details>
            {historyPanel}
          </div>
        )}

        {activeTab === 'Overview' && !isCompletedOverview && (
          <div className="min-w-0">
            <div className="space-y-6">
              {document.lifecycle === 'SIGNED' && <DocumentProgress path={progressPath} currentStep={signedProgressStep} />}

                {showAnalysis && <section aria-labelledby="potential-concerns-heading" className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <h2 id="potential-concerns-heading" className={overviewSectionHeadingClassName}><WarningAmberOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#B77900' }} />Potential concerns</h2>
                    <p className="text-sm leading-5 text-[#4B6382]">AI review · verify against original</p>
                  </div>
                  {document.analysis_status === 'partial' && <p role="alert" className="text-sm font-semibold text-[#785000]">Some sections could not be analyzed. Risk findings may be incomplete.</p>}
                  {document.risk_flags?.length ? <RiskFlags items={document.risk_flags} /> : <p className="text-base leading-7 text-[#4B6382]">No review findings are available for this document yet.</p>}
                </section>}

              {showAnalysis && <details open={document.lifecycle !== 'SIGNED'} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
                <summary className="min-h-11 cursor-pointer py-2 text-lg font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">{showAnalysis ? 'Document details' : 'Participants and document history'}</summary>
                <div className="mt-4 space-y-4">
              {showAnalysis && <section aria-labelledby="document-summary-heading" className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                <h2 id="document-summary-heading" className="inline-flex items-center gap-2 text-lg font-bold leading-6 text-[#0C2B49]"><DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document summary</h2>
                <p className="mt-2 break-words text-base leading-7 text-[#344054]">{document.summary || 'No summary is available for this document yet.'}</p>
                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-[#E8F0F8] pt-4 text-xs sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2"><dt className="font-semibold leading-4 text-[#4B6382]">Register entry</dt><dd className="mt-1 break-words text-sm font-medium leading-5 text-[#0C2B49]">{registerEntry}</dd></div>
                  <div><dt className="font-semibold leading-4 text-[#4B6382]">Created</dt><dd className="mt-1 text-sm font-medium leading-5 text-[#0C2B49]">{formatDate(document.created_at)}</dd></div>
                  {document.lifecycle === 'FINALIZED' && <div><dt className="font-semibold leading-4 text-[#4B6382]">Finalized</dt><dd className="mt-1 text-sm font-medium leading-5 text-[#0C2B49]">{formatDate(document.finalized_at)}</dd></div>}
                </dl>
              </section>}

              {participantsPanel}
              {!showTabs && canManageParticipants && <DocumentParticipantManagement documentId={document.document_id} canShare={document.permissions.can_share} canRevoke={document.permissions.can_revoke} documentError={false} onPartiesChanged={() => { void queryClient.invalidateQueries({ queryKey: ['portal-document-parties', document.document_id] }); }} />}
              {!showTabs && document.draft_url && draftCommentsPanel}

              {document.lifecycle !== 'FINALIZED' && document.draft_url && (
                <details className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                  <summary className="min-h-11 cursor-pointer py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
                    <span className={overviewSectionHeadingClassName}>
                      <DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />
                      Working draft and drafting history
                    </span>{' '}
                    <span className="text-sm font-normal leading-5 text-[#4B6382]">(Google Doc)</span>
                  </summary>
                  <div className="mt-3 border-t border-[#E8F0F8] pt-4">
                    <GoogleDraftPanel key={document.document_id} document={document} onDocumentUpdated={onDocumentUpdated} />
                  </div>
                </details>
              )}

              {canCorrectEntry && <div className="space-y-3 border-t border-[#E8F0F8] py-3">
                <button type="button" onClick={openEntryCorrection} className="inline-flex items-center gap-1.5 rounded-full border border-[#0067B3] px-4 py-2 text-sm font-extrabold text-[#0067B3]"><EditOutlinedIcon aria-hidden="true" sx={{ fontSize: 17 }} />Correct register entry</button>
              </div>}

              <div className="grid gap-4">


                {showAnalysis && hasReviewDetails && <details className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                    <summary className="min-h-11 cursor-pointer py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
                      <span className={overviewSectionHeadingClassName}><DescriptionOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Extracted details</span>{' '}
                      <span className="text-sm font-normal leading-5 text-[#4B6382]">({document.labels?.length ?? 0} labels · {document.entities?.length ?? 0} entities)</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <InsightGroup title="Labels" items={document.labels} />
                      <InsightGroup title="Entities" items={document.entities} />
                    </div>
                </details>}

                <section aria-labelledby="recent-history-heading" className="space-y-3 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
                  <div className="flex min-h-11 items-center justify-between gap-3">
                    <h2 id="recent-history-heading" className={overviewSectionHeadingClassName}><HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Recent history</h2>
                    <button type="button" aria-label="View document history" onClick={() => { if (showTabs) selectTab('History'); else window.document.getElementById('signed-document-history')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0067B3] hover:underline sm:min-h-9">View all<ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} /></button>
                  </div>
                  {historyQuery.isLoading && <p role="status" className="text-base leading-7 text-[#4B6382]">Loading history…</p>}
                  {historyQuery.isError && <p role="alert" className="text-base font-semibold leading-7 text-[#B42318]">Unable to load recent history.</p>}
                  {historyQuery.data && historyChanges.length === 0 && <EmptyState className="mt-3" icon={<HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />} title="No history recorded" description="No history has been recorded for this document yet." />}
                  {historyChanges.length > 0 && <div id="signed-document-history"><HistoryTimeline changes={(showTabs ? historyChanges.slice(-2) : [...historyChanges]).reverse()} ariaLabel="Recent document history" /></div>}
                </section>
              </div>
                </div>
              </details>}
            </div>
          </div>
        )}

        {activeTab === 'Participants' && (
          <div className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden">
            <div className="rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
              <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0C2B49]"><GroupsOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Manage participants</h2>
              <p className="mt-1 text-sm text-[#4B6382]">Invite people to this document or update their access. Access is limited to this document.</p>
            </div>
            <DocumentParticipantManagement
              documentId={document.document_id}
              canShare={document.permissions?.can_share === true}
              canRevoke={document.permissions?.can_revoke === true}
              documentError={false}
              onPartiesChanged={() => {
                void queryClient.invalidateQueries({ queryKey: ['portal-document-parties', document.document_id] });
              }}
            />
          </div>
        )}

        {activeTab === 'Comments' && (
          draftCommentsPanel
        )}

        {(activeTab === 'Files' || (!showTabs && document.lifecycle === 'SIGNED' && !isCompletedSigned)) && signedFilesPanel}
        {!showTabs && document.lifecycle === 'SIGNED' && !isCompletedSigned && participantsPanel}
        {!showTabs && document.lifecycle === 'SIGNED' && !isCompletedSigned && historyPanel}



        {activeTab === 'Blockchain' && (
          <div className="space-y-5 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0C2B49]"><AccountTreeIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Blockchain record</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#4B6382]">Finalizing saves the PDF’s fingerprint to the blockchain. Compare fingerprints to check if the PDF has changed.</p>
              </div>
            </div>
            {(finalizationResult || document.on_chain) && isMockMode() && (
              <p role="note" className="rounded-xl border border-[#F1D29A] bg-[#FFF8E8] px-4 py-3 text-sm font-bold text-[#785000]">Synthetic demo record. No real PDF digest or blockchain transaction was produced.</p>
            )}
            <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#4B6382]">Record status</dt>
                <dd className="mt-1 text-[#0C2B49]">
                  <span>{anchorLabel(document.lifecycle, document.on_chain)}</span>
                  {document.lifecycle === 'SIGNED' && !document.on_chain && (
                    <p className="mt-0.5 text-xs text-[#5B6F8A]">Signed copy attached. Blockchain recording requires finalization.</p>
                  )}
                  {document.lifecycle === 'FINALIZED' && !document.on_chain && (
                    <p className="mt-0.5 text-sm text-[#5B6F8A]">Submitted; waiting for network confirmation.</p>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#4B6382]">Network</dt>
                <dd className="mt-1 flex items-center gap-2 text-[#0C2B49]">
                  <span>{isMockMode() ? 'Mock environment' : 'Base Sepolia'}</span>
                  <span className="inline-flex items-center rounded-full bg-[#EAF4FF] px-2 py-0.5 text-xs font-semibold text-[#0067B3]">
                    {isMockMode() ? 'Simulated' : 'Testnet'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#4B6382]">Document fingerprint (hash)</dt>
                <dd className="mt-1 text-[#0C2B49]">
                  {(finalizationResult?.data_hash || document.document_hash) ? (
                    <CopyableIdentifier value={finalizationResult?.data_hash || document.document_hash || ''} label="document hash" />
                  ) : (
                    <span className="text-[#4B6382]">No fingerprint recorded yet</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#4B6382]">Transaction ID</dt>
                <dd className="mt-1 text-[#0C2B49]">
                  {(chainQuery.data?.tx_hash || finalizationResult?.tx_hash) ? (
                    <CopyableIdentifier value={chainQuery.data?.tx_hash || finalizationResult?.tx_hash || ''} label="transaction ID" />
                  ) : (
                    <span className="text-[#4B6382]">No transaction ID recorded</span>
                  )}
                </dd>
              </div>
              {document.document_id && <div><dt className="font-bold text-[#4B6382]">Document ID</dt><dd className="mt-1 text-[#0C2B49]"><CopyableIdentifier value={document.document_id} label="document ID" /></dd></div>}
              {finalizationResult?.onchain_document_id && <div><dt className="font-bold text-[#4B6382]">Blockchain record ID</dt><dd className="mt-1 text-[#0C2B49]"><CopyableIdentifier value={finalizationResult.onchain_document_id} label="blockchain record ID" /></dd></div>}
              {document.on_chain && <div><dt className="font-bold text-[#4B6382]">Recorded</dt><dd className="mt-1 text-[#0C2B49]">{formatDate(document.finalized_at)}</dd></div>}
            </dl>
            {isMockMode() ? (
              <p className="text-sm text-[#4B6382]">Transaction details are unavailable in mock mode.</p>
            ) : chainQuery.isLoading ? (
              <p role="status" className="text-sm text-[#4B6382]">Loading transaction details…</p>
            ) : transactionUrl ? (
              <a href={transactionUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-[#0067B3] px-4 py-2.5 text-sm font-bold text-[#0067B3] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">View transaction on Base Sepolia <span className="sr-only">(opens in a new tab)</span></a>
            ) : document.on_chain ? (
              <p className="text-sm text-[#4B6382]">Transaction link unavailable.</p>
            ) : document.lifecycle === 'FINALIZED' ? (
              <p className="text-sm text-[#4B6382]">Transaction link unavailable while waiting for confirmation.</p>
            ) : (
              <p className="text-sm text-[#4B6382]">No transaction recorded yet.</p>
            )}
          </div>
        )}

        {activeTab === 'History' && (
          <section aria-labelledby="document-history-heading" className="space-y-4 rounded-xl border border-[#D7E4F2] bg-white p-4 sm:p-5">
            <div><h2 id="document-history-heading" className={overviewSectionHeadingClassName}><HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 20, color: '#0067B3' }} />Document history</h2><p className="mt-1 text-sm leading-5 text-[#4B6382]">Lifecycle changes to this document, from oldest to newest.</p></div>
            {historyQuery.isLoading && <p role="status" className="text-base leading-7 text-[#4B6382]">Loading history…</p>}
            {historyQuery.isError && <p role="alert" className="text-base font-semibold leading-7 text-[#B42318]">Unable to load document history.</p>}
            {historyQuery.data && historyChanges.length === 0 && <EmptyState className="mt-3" icon={<HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />} title="No history recorded" description="No history has been recorded for this document yet." />}
            {historyChanges.length > 0 && <HistoryTimeline changes={historyChanges} ariaLabel="Document history" showActor />}
          </section>
        )}

      </div>
        </>
      )}
      <Modal open={canCorrectEntry && correctingEntry} onClose={closeEntryCorrection} title="Correct document register entry" size="wide">
        <div className="max-h-[70dvh] overflow-y-auto">
          <form className="space-y-3" onSubmit={submitEntryCorrection}>
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
            <div className="flex flex-wrap gap-2"><button type="submit" disabled={correctEntryMutation.isPending} className="rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{correctEntryMutation.isPending ? 'Saving…' : 'Save correction'}</button><button type="button" disabled={correctEntryMutation.isPending} onClick={closeEntryCorrection} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button></div>
          </form>
        </div>
      </Modal>
      {(showWorkflowStatus || workflowActions) && <div className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <section aria-label="Next action" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {needsSignedPdfReview ? <div><h3 className="text-sm font-bold text-[#0C2B49]">Review signed PDF</h3><p className="mt-1 text-sm leading-5 text-[#4B6382]">Check the signed PDF before continuing to text and risk review.</p></div> : showWorkflowStatus && <FinalizationNextStep document={document} role={role} outcomeUnknown={finalizationOutcomeUnknown} />}
            {needsSignedPdfReview ? <button type="button" onClick={continueToTextReview} className="min-h-11 rounded-full bg-[#0067B3] px-5 py-2 text-sm font-extrabold text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Continue to text review</button> : workflowActions}
          </div>
          {showWorkflowStatus && isProcessing && !finalizationOutcomeUnknown && <div role="progressbar" aria-label="Document processing" aria-valuetext={status === 'QUEUED' ? 'Waiting to start' : status === 'ENRICHING' ? 'Analyzing document' : 'Extracting text'} className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8F0F8]">
            <div className="document-processing-indeterminate h-full w-2/5 rounded-full bg-[#0067B3] motion-reduce:animate-none" />
          </div>}
        </section>
      </div>}
    </section>
  );
}
