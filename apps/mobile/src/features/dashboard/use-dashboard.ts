import { useMemo } from 'react';

import { useDocuments } from '@/services/query';

export function useDashboard() {
  const documentsQuery = useDocuments();

  return useMemo(() => {
    const documents = documentsQuery.data ?? [];
    const documentsCount = documents.length;
    const anchoredOnChainCount = documents.filter(
      (doc) => doc.status === 'COMPLETED',
    ).length;
    const processingCount = documents.filter(
      (doc) => doc.status === 'PROCESSING' || doc.status === 'QUEUED',
    ).length;
    return {
      documentsCount,
      anchoredOnChainCount,
      processingCount,
      pendingSharedDocumentsCount: 0,
      isLoading: documentsQuery.isLoading,
    };
  }, [documentsQuery.data, documentsQuery.isLoading]);
}
