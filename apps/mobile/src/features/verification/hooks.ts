import { useQuery } from '@tanstack/react-query';

import { verifyDocumentByCode } from './api';

export function usePublicVerification(code?: string) {
  return useQuery({
    queryKey: ['public-verification', code],
    queryFn: () => verifyDocumentByCode(code ?? ''),
    enabled: Boolean(code),
    retry: false,
  });
}
