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
  role: 'issuer' | 'participant',
  status: string | null | undefined,
  lifecycle: DemoDocumentLifecycle['lifecycle'],
): boolean {
  return role === 'issuer' && status?.trim().toUpperCase() === 'COMPLETED' && lifecycle === 'draft';
}

export function canRestoreDocument(
  role: 'issuer' | 'participant',
  integrityState: DemoIntegrityState,
  snapshots: DemoDocumentSnapshot[],
): boolean {
  return role === 'issuer' && integrityState === 'mismatch' && snapshots.length > 0;
}
