import { useMemo } from 'react';

import { useDocuments } from '@/services/query';

export function useDashboard() {
  const documentsQuery = useDocuments();

  return useMemo(() => {
    const documents = documentsQuery.data ?? [];
    const documentsCount = documents.length;
    const verifiedCount = documents.filter(
      (doc) => doc.status === 'COMPLETED',
    ).length;
    const tamperedCount = documents.filter(
      (doc) => doc.status === 'FAILED',
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
  }, [documentsQuery.data, documentsQuery.isLoading]);
}
