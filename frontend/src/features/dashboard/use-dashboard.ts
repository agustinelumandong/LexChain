import { useMemo } from 'react';

import { useDocuments } from '@/services/query';

export function useDashboard() {
  const documentsQuery = useDocuments();
  const documents = documentsQuery.data ?? [];

  return useMemo(() => {
    const documentsCount = documents.length;
    const verifiedCount = documents.filter(
      (doc) => doc.status === 'verified',
    ).length;
    const tamperedCount = documents.filter(
      (doc) => doc.status === 'failed' || doc.status === 'error',
    ).length;
    const recentDocuments = [...documents]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 3);

    return {
      documentsCount,
      verifiedCount,
      tamperedCount,
      recentDocuments,
      isLoading: documentsQuery.isLoading,
    };
  }, [documents, documentsQuery.isLoading]);
}
