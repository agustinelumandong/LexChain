import type { ApiSchema } from '@/shared/types';
import { portalFetch } from '@/shared/api/client';

export type RegisterBook = ApiSchema<'BookResponse'>;
export type BookEntriesResponse = ApiSchema<'BookEntriesResponse'>;
export type BookCreateRequest = {
  book_number: number;
  series_year: number;
  status?: 'OPEN' | 'CLOSED';
};

export const BOOK_ENTRIES_PAGE_SIZE = 5;

export async function listRegisterBooks(): Promise<RegisterBook[]> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/books/?limit=50&offset=0')}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load books');
  return response.json() as Promise<RegisterBook[]>;
}

export async function listRegisterBookEntries(bookId: string, offset: number, limit = BOOK_ENTRIES_PAGE_SIZE): Promise<BookEntriesResponse> {
  const path = `/books/${bookId}/entries?limit=${limit}&offset=${offset}`;
  return portalFetch<BookEntriesResponse>(path);
}

function getBookErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== 'object' || payload === null) return fallback;

  const detail = 'detail' in payload ? payload.detail : undefined;
  const message = 'message' in payload ? payload.message : undefined;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (typeof item !== 'object' || item === null || !('msg' in item) || typeof item.msg !== 'string') return [];
      return [item.msg];
    });
    if (messages.length) return messages.join(' ');
  }
  if (typeof message === 'string') return message;
  return fallback;
}

async function throwBookError(response: Response, fallback: string): Promise<never> {
  const error = await response.json().catch(() => null);
  throw new Error(getBookErrorMessage(error, fallback));
}

export async function createRegisterBook(payload: BookCreateRequest): Promise<RegisterBook> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent('/books/')}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwBookError(response, 'Unable to register book');
  return response.json();
}

export async function deleteRegisterBook(bookId: string): Promise<void> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/books/${bookId}`)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!response.ok) await throwBookError(response, 'Unable to delete book');
}

export async function closeRegisterBook(bookId: string): Promise<RegisterBook> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/books/${bookId}/close`)}`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) await throwBookError(response, 'Unable to close book');
  return response.json();
}
