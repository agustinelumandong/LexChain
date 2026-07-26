import type {
  DemoDocumentLifecycle,
  DemoDocumentSnapshot,
} from './document-lifecycle-ui';

function required(value: string, message: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

async function lifecycleFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const proxy = init?.method ? '/api/portal/proxy-post' : '/api/portal/proxy';
  const response = await fetch(`${proxy}?path=${encodeURIComponent(path)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { detail?: string; message?: string };
    throw new Error(error.detail ?? error.message ?? `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function finalizeDemoDocument(documentId: string): Promise<DemoDocumentLifecycle> {
  const id = required(documentId, 'Document ID is required');
  return lifecycleFetch(`/documents/${id}/finalize`, { method: 'POST' });
}

export async function listDemoSnapshots(documentId: string): Promise<DemoDocumentSnapshot[]> {
  const id = required(documentId, 'Document ID is required');
  return lifecycleFetch(`/documents/${id}/snapshots`);
}

export async function restoreDemoSnapshot(
  documentId: string,
  snapshotId: string,
  reason: string,
): Promise<DemoDocumentLifecycle> {
  const id = required(documentId, 'Document ID is required');
  const snapshot = required(snapshotId, 'Snapshot ID is required');
  const restorationReason = required(reason, 'Restoration reason is required');
  return lifecycleFetch(`/documents/${id}/snapshots/${snapshot}/restore`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reason: restorationReason }),
  });
}
