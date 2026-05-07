import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { documentsApi, type GlobalSearchPayload } from '@/services/api';
import type { PickedUploadFile } from '@/types';

import { queryKeys } from './keys';

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: documentsApi.list,
  });
}

export function useDocument(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ''),
    queryFn: () => documentsApi.detail(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: PickedUploadFile) => documentsApi.upload(file),
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
