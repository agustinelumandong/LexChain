import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { documentsApi, type GlobalSearchPayload } from '@/services/api';
import type { PickedUploadFile } from '@/types';

import { queryKeys } from './keys';

export function useDocuments(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: () => documentsApi.list(params),
  });
}

export function useDocument(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ''),
    queryFn: () => documentsApi.getById(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, fileName }: { file: PickedUploadFile; fileName: string }) =>
      documentsApi.upload(file, fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useGlobalSearch(payload: GlobalSearchPayload, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.documents.search(payload.query),
    queryFn: () => documentsApi.globalSearch(payload),
    enabled,
  });
}

export function useSearchDocument(documentId: string, query: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'search', query] as const,
    queryFn: () => documentsApi.search(documentId, query),
    enabled: Boolean(documentId) && query.trim().length > 0,
  });
}

export function useRenameDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, fileName }: { documentId: string; fileName: string }) =>
      documentsApi.rename(documentId, fileName),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}
