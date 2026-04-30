import { useMemo } from 'react';
import { MOCK_DOCUMENTS } from '@/mocks';

export function useDashboard() {
  return useMemo(() => {
    const documentsCount = MOCK_DOCUMENTS.length;
     const activeGrantsCount = MOCK_DOCUMENTS.reduce(
      (total, document) => total + document.whitelist.grants.length,
      0,
     );
    const reviewNeededCount = MOCK_DOCUMENTS.filter(
      (document) => document.status === 'review-needed',
    ).length;
     const verifiedCount = MOCK_DOCUMENTS.filter(
      (document) => document.status === 'verified',
     ).length;
    const recentDocuments = [...MOCK_DOCUMENTS]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 3);

    return {
      documentsCount,
      activeGrantsCount,
      reviewNeededCount,
      verifiedCount,
      recentDocuments,
    };
  }, []);
}


