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

export function listDraftComments(documentId: string): Promise<ApiSchema<'DraftCommentListResponse'>> {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/comments`);
}

export function syncDraftComments(documentId: string): Promise<ApiSchema<'DraftCommentListResponse'>> {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/comments/sync`, { method: 'POST' });
}

export function markDocumentReady(documentId: string): Promise<ApiSchema<'DocumentResponse'>> {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/ready`, { method: 'POST' });
}

export function reopenDocument(documentId: string): Promise<ApiSchema<'DocumentResponse'>> {
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/reopen`, { method: 'POST' });
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

export async function attachSignedCopy(documentId: string, file: File, filing: { bookId: string; docNo?: number | null; pageNo?: number | null }): Promise<ApiSchema<'DocumentResponse'>> {
  const query = new URLSearchParams({ book_id: required(filing.bookId, 'Register book is required') });
  if (filing.docNo != null) query.set('doc_no', String(filing.docNo));
  if (filing.pageNo != null) query.set('page_no', String(filing.pageNo));
  const form = new FormData();
  form.set('file', file);
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/signed-copy?${query}`, { method: 'POST', body: form });
}

export async function replaceSignedCopy(documentId: string, file: File, reason: string): Promise<ApiSchema<'DocumentResponse'>> {
  const form = new FormData();
  form.set('file', file);
  form.set('reason', required(reason, 'Replacement reason is required'));
  return lifecycleFetch(`/documents/${required(documentId, 'Document ID is required')}/signed-copy`, { method: 'PUT', body: form });
}
