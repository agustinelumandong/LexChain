import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { booksApi, type BookCreateRequest, type ListBooksParams } from '@/services/api';

import { queryKeys } from './keys';

export function useBooks(params?: ListBooksParams) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => booksApi.list(params),
  });
}

export function useBook(bookId?: string) {
  return useQuery({
    queryKey: queryKeys.books.detail(bookId ?? ''),
    queryFn: () => booksApi.getById(bookId ?? ''),
    enabled: Boolean(bookId),
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookCreateRequest) => booksApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
}
