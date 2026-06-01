import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockBooksApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type BookCreateRequest = ApiSchema<'BookCreateRequest'>;
export type BookResponse = ApiSchema<'BookResponse'>;

export type ListBooksParams = {
  limit?: number;
  offset?: number;
};

const toQueryString = (params?: ListBooksParams) => {
  const searchParams = new URLSearchParams();

  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.offset !== undefined) {
    searchParams.set('offset', String(params.offset));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const encodeBookId = (bookId: string) => {
  const trimmed = bookId.trim();

  if (!trimmed) {
    throw new Error('bookId is required');
  }

  return encodeURIComponent(trimmed);
};

export const booksApi = {
  list: (params?: ListBooksParams) => {
    if (env.useMockApi) {
      return mockBooksApi.list(params);
    }

    return apiClient.get<BookResponse[]>(`/books/${toQueryString(params)}`);
  },

  getById: (bookId: string) => {
    const encodedBookId = encodeBookId(bookId);

    if (env.useMockApi) {
      return mockBooksApi.getById(bookId);
    }

    return apiClient.get<BookResponse>(`/books/${encodedBookId}`);
  },

  create: (payload: BookCreateRequest) => {
    if (env.useMockApi) {
      return mockBooksApi.create(payload);
    }

    return apiClient.post<BookResponse>('/books/', payload);
  },
};
