import { useQuery } from '@tanstack/react-query';

import { documentsApi } from '@/services/api';
import { queryKeys } from '@/services/query/keys';

import { isCompleteStatus } from '../utils/processing-status';

export function useProcessingDocumentStatus(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ''),
    queryFn: () => documentsApi.getById(documentId ?? ''),
    enabled: Boolean(documentId),
    refetchInterval: (query) =>
      isCompleteStatus(query.state.data?.status) ? false : 2500,
  });
}
