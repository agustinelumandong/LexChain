import type { ApiSchema } from '@/shared/types/index';

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

export async function finalizeDocument(documentId: string): Promise<ApiSchema<'RecordResponse'>> {
  const id = required(documentId, 'Document ID is required');
  return lifecycleFetch(`/documents/${id}/finalize`, { method: 'POST' });
}

export async function renameDocument(documentId: string, fileName: string) {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ file_name: required(fileName, 'Document name is required') }),
  });
}

export async function listSignedCopies(documentId: string): Promise<ApiSchema<'SignedCopyListResponse'>> {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/signed-copies`);
}
