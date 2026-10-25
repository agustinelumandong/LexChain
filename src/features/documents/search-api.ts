import { portalRequest } from '@/shared/api/client';
import type { PortalSearchHit } from '@/features/access';
import type { ApiSchema } from '@/shared/types';

export type PortalSearchResponse = Omit<ApiSchema<'GlobalSearchResponse'>, 'results'> & {
  results: PortalSearchHit[];
};

export type RegisterLookupQuery = Pick<
  ApiSchema<'RegisterReference'>,
  'doc_no' | 'page_no' | 'book_number' | 'series_year'
>;

export async function searchDocumentsByRegisterReference(
  reference: RegisterLookupQuery,
): Promise<ApiSchema<'RegisterLookupResponse'>> {
  const params = new URLSearchParams({
    doc_no: String(reference.doc_no),
    page_no: String(reference.page_no),
    book_number: String(reference.book_number),
    series_year: String(reference.series_year),
  });
  const path = `/documents/register-lookup?${params.toString()}`;
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Register lookup failed. Please try again.');
  return response.json();
}

export async function searchPortalDocuments(query: string): Promise<PortalSearchResponse> {
  const response = await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent('/search')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    credentials: 'same-origin',
  });
  return response.json();
}

export async function searchDocument(documentId: string, query: string): Promise<ApiSchema<'SearchResponse'>> {
  const id = documentId.trim();
  const body: ApiSchema<'SearchRequest'> = { query: query.trim() };
  if (!id) throw new Error('Document ID is required');
  if (!body.query) throw new Error('Search query is required');

  const path = `/documents/${encodeURIComponent(id)}/search`;
  const response = await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  return response.json() as Promise<ApiSchema<'SearchResponse'>>;
}
