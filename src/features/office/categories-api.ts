import type { ApiSchema } from '@/shared/types';
import { portalFetch, portalRequest } from '@/shared/api/client';

export type DocumentCategory = ApiSchema<'CategoryResponse'>;
export type CategoryWriteRequest = ApiSchema<'CategoryWriteRequest'>;

export async function listCategories(): Promise<DocumentCategory[]> {
  return portalFetch<DocumentCategory[]>('/categories/');
}

async function writeCategory(
  path: string,
  method: 'POST' | 'PATCH',
  payload?: CategoryWriteRequest,
): Promise<DocumentCategory> {
  const response = await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(path)}`, {
    method,
    ...(payload ? {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    } : {}),
  });
  return response.json();
}

export function createCategory(payload: CategoryWriteRequest): Promise<DocumentCategory> {
  return writeCategory('/categories/', 'POST', payload);
}

export function updateCategory(categoryId: string, payload: CategoryWriteRequest): Promise<DocumentCategory> {
  return writeCategory(`/categories/${categoryId}`, 'PATCH', payload);
}

export function deactivateCategory(categoryId: string): Promise<DocumentCategory> {
  return writeCategory(`/categories/${categoryId}/deactivate`, 'POST');
}
