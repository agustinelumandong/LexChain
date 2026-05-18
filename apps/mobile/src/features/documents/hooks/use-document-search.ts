import { useQuery } from '@tanstack/react-query';

import { fetchSearchResultsWithDetails } from '@/services/api/documents.api';

export function useDocumentSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearchResultsWithDetails({ query }),
    enabled,
  });
}
