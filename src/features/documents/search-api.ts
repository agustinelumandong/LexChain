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
