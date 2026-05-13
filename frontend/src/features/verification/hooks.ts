import { useQuery } from '@tanstack/react-query';

import { getDemoPublicVerification, verifyDocumentByCode } from './api';

export function usePublicVerification(code?: string) {
  return useQuery({
    queryKey: ['public-verification', code],
    queryFn: async () => {
      const verificationCode = code ?? '';

      try {
        return await verifyDocumentByCode(verificationCode);
      } catch {
        return getDemoPublicVerification(verificationCode);
      }
    },
    enabled: Boolean(code),
  });
}
