import type { ApiSchema } from '@/shared/types';
import { portalFetch } from '@/shared/api/client';

export type RegisterBook = ApiSchema<'BookResponse'>;
export type BookEntriesResponse = ApiSchema<'BookEntriesResponse'>;

export const BOOK_ENTRIES_PAGE_SIZE = 50;

export async function listRegisterBooks(): Promise<RegisterBook[]> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/books/?limit=50&offset=0')}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load books');
  return response.json() as Promise<RegisterBook[]>;
}

export async function listRegisterBookEntries(bookId: string, offset: number): Promise<BookEntriesResponse> {
  const path = `/books/${bookId}/entries?limit=${BOOK_ENTRIES_PAGE_SIZE}&offset=${offset}`;
  return portalFetch<BookEntriesResponse>(path);
}
