import { portalRequest } from '@/shared/api/client';
import { PortalApiError } from '@/shared/api/portal-error';
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
  let response: Response;
  try {
    response = await portalRequest(`${proxy}?path=${encodeURIComponent(path)}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof PortalApiError) {
      const details = error.details;
      const reason = typeof details === 'object' && details !== null && 'reason' in details && typeof details.reason === 'string' ? details.reason : undefined;
      const envelope = error.body;
      const detail = typeof envelope === 'object' && envelope !== null && 'detail' in envelope && typeof envelope.detail === 'string' ? envelope.detail : undefined;
      throw Object.assign(error, { code: reason ?? detail ?? error.message });
    }
    throw error;
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
