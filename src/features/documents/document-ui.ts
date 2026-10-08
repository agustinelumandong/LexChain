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

export function getDocumentActions(
  role: PortalUiRole,
  document: ApiSchema<'DocumentResponse'>,
): string[] {
  const actions: string[] = [];
  const status = document.status?.trim().toUpperCase();
  if (role === 'lawyer' && document.permissions.can_rename) actions.push('Rename document');
  if (role === 'lawyer' && (status === 'AWAITING_REVIEW' || status === 'READY_FOR_REVIEW')) actions.push('Review extracted text');
  if (role === 'lawyer' && document.permissions.can_finalize) actions.push('Finalize');
  if (document.permissions.can_view && document.on_chain) actions.push('Verify integrity');
  return actions;
}

export function getDocumentLifecycleLabel(lifecycle: string): string {
  const [first, ...rest] = lifecycle.toLowerCase().replaceAll('_', ' ').split(' ');
  return [first ? `${first[0].toUpperCase()}${first.slice(1)}` : '', ...rest].filter(Boolean).join(' ');
}
