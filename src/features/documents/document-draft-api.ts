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

const MAX_GOOGLE_DRAFT_UPLOAD_BYTES = 10 * 1024 * 1024;

export function getGoogleDraftUploadFileError(file: File): string | null {
  if (file.size === 0) return 'Choose a non-empty document file.';
  if (file.size > MAX_GOOGLE_DRAFT_UPLOAD_BYTES) return 'Choose a file that is 10 MiB or smaller.';
  return /\.(docx|doc|odt|rtf)$/i.test(file.name) ? null : 'Choose a .docx, .doc, .odt, or .rtf file.';
}

async function request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const proxy = method === 'GET' ? '/api/portal/proxy' : '/api/portal/proxy-post';
  let response: Response;
  try {
    response = await portalRequest(`${proxy}?path=${encodeURIComponent(path)}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : body instanceof FormData ? { body } : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
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
  if (!document.document_id || document.lifecycle !== 'PREPARING') throw new Error('LexChain did not receive a preparing document record.');
  return document;
}

export async function getGooglePickerToken(): Promise<ApiSchema<'GooglePickerToken'>> {
  const token = await request<ApiSchema<'GooglePickerToken'>>('/google/picker-token', 'GET');
  if (!token.access_token || !Number.isFinite(Date.parse(token.expires_at))) throw new Error('Google returned an invalid Picker token.');
  return token;
}

export type GoogleDraftSource = 'blank' | 'template' | 'existing' | 'upload';

export async function createGoogleDraft(documentId: string, source: GoogleDraftSource, fileId?: string, file?: File): Promise<ApiSchema<'DocumentResponse'>> {
  if (!documentId.trim()) throw new Error('Document ID is required.');
  if (source === 'upload') {
    if (!file) throw new Error('Choose a document file.');
    const fileError = getGoogleDraftUploadFileError(file);
    if (fileError) throw new Error(fileError);
  } else if (source !== 'blank' && !fileId?.trim()) {
    throw new Error('Choose a Google Doc first.');
  }
  const form = new FormData();
  form.set('source', source);
  if (source === 'upload' && file) form.set('file', file);
  else if (source !== 'blank' && fileId) form.set('file_id', fileId);
  const document = await request<ApiSchema<'DocumentResponse'>>(`/documents/${encodeURIComponent(documentId)}/draft`, 'POST', form);
  if (!document.draft_url) throw new Error('LexChain did not receive a Google draft link.');
  if (!isGoogleDraftUrl(document.draft_url)) throw new Error('LexChain received an invalid Google draft link.');
  return document;
}
