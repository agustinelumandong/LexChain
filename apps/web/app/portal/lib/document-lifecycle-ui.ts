import type {
  DemoDocumentLifecycle,
  DemoDocumentSnapshot,
  DemoIntegrityState,
} from '@/lib/portal-mock';

export type {
  DemoAnchorStatus,
  DemoDocumentLifecycle,
  DemoDocumentSnapshot,
  DemoIntegrityState,
} from '@/lib/portal-mock';

export function canFinalizeDocument(
  role: 'lawyer' | 'user',
  status: string | null | undefined,
  lifecycle: DemoDocumentLifecycle['lifecycle'],
): boolean {
  return role === 'lawyer' && status?.trim().toUpperCase() === 'COMPLETED' && lifecycle?.toLowerCase() === 'draft';
}

export function canRestoreDocument(
  role: 'lawyer' | 'user',
  integrityState: DemoIntegrityState,
  snapshots: DemoDocumentSnapshot[],
): boolean {
  return role === 'lawyer' && integrityState === 'mismatch' && snapshots.length > 0;
}
