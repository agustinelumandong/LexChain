import type { PortalUiRole } from "@/features/access";
import type { ApiSchema } from "@/shared/types";

export function getDocumentStatusLabel(status?: string | null): string {
  if (status == null) return 'No processing status yet';
  const value = status?.trim().toUpperCase();
  if (value === 'QUEUED') return 'Queued';
  if (value === 'PROCESSING') return 'Processing';
  if (value === 'AWAITING_REVIEW' || value === 'READY_FOR_REVIEW') return 'Ready for review';
  if (value === 'ENRICHING') return 'Preparing document';
  if (value === 'COMPLETED') return 'Completed';
  if (value === 'ANCHORED') return 'Completed';
  if (value === 'FAILED') return 'Failed';
  return 'Unknown';
}

export function getDocumentProcessingStatusLabel(lifecycle: string, status?: string | null): string {
  return lifecycle === 'FINALIZED' && status?.trim().toUpperCase() === 'FAILED'
    ? 'Processing failed'
    : getDocumentStatusLabel(status);
}

export function getDocumentLifecycleBadgeClasses(lifecycle: string): string {
  const value = lifecycle.trim().toUpperCase();
  if (value === 'FINALIZED' || value === 'SIGNED') return 'bg-emerald-50 text-emerald-700';
  if (value === 'CANCELLED') return 'bg-red-50 text-red-700';
  return 'bg-blue-50 text-blue-700';
}

export function getDocumentProcessingBadgeClasses(status?: string | null): string {
  const value = status?.trim().toUpperCase();
  if (value === 'COMPLETED' || value === 'ANCHORED' || value === 'PROCESSED') return 'bg-emerald-50 text-emerald-700';
  if (value === 'FAILED') return 'bg-red-50 text-red-700';
  if (value === 'QUEUED' || value === 'PROCESSING' || value === 'ENRICHING' || value === 'PENDING' || value === 'ACCEPTED' || value === 'AWAITING_REVIEW' || value === 'READY_FOR_REVIEW') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

export function getDocumentActions(
  role: PortalUiRole,
  document: ApiSchema<'DocumentResponse'>,
): string[] {
  const actions: string[] = [];
  const status = document.status?.trim().toUpperCase();
  if (role === 'lawyer' && document.permissions.can_rename) actions.push('Rename document');
  if (role === 'lawyer' && (status === 'AWAITING_REVIEW' || status === 'READY_FOR_REVIEW')) actions.push('Review extracted text');
  if (role === 'lawyer' && document.permissions.can_finalize) actions.push('Finalize');
  const lifecycle = document.lifecycle?.trim().toUpperCase();
  if (document.permissions.can_view && (lifecycle === 'FINALIZED' || document.on_chain)) actions.push('Check document');
  if (role === 'lawyer' && document.permissions.can_retry_processing) actions.push('Retry processing');
  return actions;
}

export function getDocumentLifecycleLabel(lifecycle: string): string {
  const [first, ...rest] = lifecycle.toLowerCase().replaceAll('_', ' ').split(' ');
  return [first ? `${first[0].toUpperCase()}${first.slice(1)}` : '', ...rest].filter(Boolean).join(' ');
}
