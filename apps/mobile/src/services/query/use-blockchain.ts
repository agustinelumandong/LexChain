import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { blockchainApi } from '@/services/api';

import { queryKeys } from './keys';

export function useVerifyOnChainDocument(documentId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.blockchain.verify(documentId ?? ''),
    queryFn: () => blockchainApi.verify(documentId ?? ''),
    enabled: enabled && Boolean(documentId),
  });
}

export function useNotarizeDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => blockchainApi.notarize(documentId),
    onSuccess: (_, documentId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blockchain.verify(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}
