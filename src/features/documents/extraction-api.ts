import { portalRequest } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types/index';

export type ExtractionReview = ApiSchema<'ExtractionReviewResponse'>;

async function extractionRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const proxy = init?.method ? '/api/portal/proxy-post' : '/api/portal/proxy';
  const response = await portalRequest(`${proxy}?path=${encodeURIComponent(path)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  });

  return response.json() as Promise<T>;
}

export function getExtractionReview(id: string): Promise<ExtractionReview> {
  return extractionRequest(`/documents/${id}/extraction`);
}

export function saveExtractionEdits(id: string, edits: ApiSchema<'BlockEdit'>[]): Promise<ExtractionReview> {
  return extractionRequest(`/documents/${id}/extraction`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ edits }),
  });
}

export function analyzeExtraction(id: string): Promise<ExtractionReview> {
  return extractionRequest(`/documents/${id}/extraction/analyze`, { method: 'POST' });
}

export function approveExtraction(id: string): Promise<ApiSchema<'ApproveExtractionResponse'>> {
  return extractionRequest(`/documents/${id}/extraction/approve`, { method: 'POST' });
}
