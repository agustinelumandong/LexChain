import type { ApiSchema } from '@/shared/types';

export function isGoogleDraftUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'docs.google.com';
  } catch {
    return false;
  }
}

async function request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const proxy = method === 'GET' ? '/api/portal/proxy' : '/api/portal/proxy-post';
  const response = await fetch(`${proxy}?path=${encodeURIComponent(path)}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { detail?: unknown; message?: unknown; details?: { reason?: unknown } };
    const reason = typeof error.details?.reason === 'string' ? error.details.reason : undefined;
    const detail = typeof error.detail === 'string' ? error.detail : undefined;
    const message = detail ?? (typeof error.message === 'string' ? error.message : reason);
    throw Object.assign(new Error(message ?? `Request failed (${response.status})`), { status: response.status, code: reason ?? detail ?? message });
  }
  return response.json() as Promise<T>;
}

export async function openDocumentRecord(fileName: string): Promise<ApiSchema<'DocumentResponse'>> {
  const name = fileName.trim();
  if (!name) throw new Error('Enter a document name.');
  const document = await request<ApiSchema<'DocumentResponse'>>('/documents/', 'POST', { file_name: name });
  if (!document.document_id || document.lifecycle !== 'PREPARING') throw new Error('The backend did not return a preparing document record.');
  return document;
}

export async function getGooglePickerToken(): Promise<ApiSchema<'GooglePickerToken'>> {
  const token = await request<ApiSchema<'GooglePickerToken'>>('/google/picker-token', 'GET');
  if (!token.access_token || !Number.isFinite(Date.parse(token.expires_at))) throw new Error('Google returned an invalid Picker token.');
  return token;
}

export async function createGoogleDraft(documentId: string, source: ApiSchema<'CreateDraftRequest'>['source'], fileId?: string): Promise<ApiSchema<'DocumentResponse'>> {
  if (!documentId.trim()) throw new Error('Document ID is required.');
  if (source !== 'blank' && !fileId?.trim()) throw new Error('Choose a Google Doc first.');
  const document = await request<ApiSchema<'DocumentResponse'>>(`/documents/${encodeURIComponent(documentId)}/draft`, 'POST', {
    source,
    ...(source === 'blank' ? {} : { file_id: fileId }),
  });
  if (!document.draft_url) throw new Error('The backend did not return a Google draft link.');
  if (!isGoogleDraftUrl(document.draft_url)) throw new Error('The backend returned an invalid Google draft link.');
  return document;
}
