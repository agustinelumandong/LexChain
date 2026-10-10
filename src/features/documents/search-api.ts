import type { PortalSearchHit } from '@/features/access';
import type { ApiSchema } from '@/shared/types';

export type PortalSearchResponse = Omit<ApiSchema<'GlobalSearchResponse'>, 'results'> & {
  results: PortalSearchHit[];
};

export async function searchPortalDocuments(query: string): Promise<PortalSearchResponse> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent('/search')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Search failed. Please try again.');
  return response.json();
}

export async function searchDocument(documentId: string, query: string): Promise<ApiSchema<'SearchResponse'>> {
  const id = documentId.trim();
  const body: ApiSchema<'SearchRequest'> = { query: query.trim() };
  if (!id) throw new Error('Document ID is required');
  if (!body.query) throw new Error('Search query is required');

  const path = `/documents/${encodeURIComponent(id)}/search`;
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Search failed. Please try again.');
  return response.json() as Promise<ApiSchema<'SearchResponse'>>;
}
