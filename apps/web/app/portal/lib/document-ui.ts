import type { PortalUiRole } from './portal-role';

export function getDocumentStatusLabel(status?: string | null): string {
  const value = status?.trim().toUpperCase();
  if (value === 'QUEUED') return 'Queued';
  if (value === 'PROCESSING') return 'Processing';
  if (value === 'COMPLETED') return 'Completed';
  if (value === 'ANCHORED') return 'Completed';
  if (value === 'FAILED') return 'Failed';
  return 'Unknown';
}

export function getDocumentActions(
  role: PortalUiRole,
  document: { status?: string | null; on_chain?: boolean | null },
): string[] {
  if (role !== 'issuer') return ['View PDF'];
  if (document.on_chain) return ['View PDF', 'Verify Integrity'];
  return ['View PDF'];
}
