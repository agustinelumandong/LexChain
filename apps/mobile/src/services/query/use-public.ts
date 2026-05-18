import { useMutation } from '@tanstack/react-query';

import { publicApi } from '@/services/api';
import type { PickedUploadFile } from '@/types';

export function usePublicVerifyDocument() {
  return useMutation({
    mutationFn: (file: PickedUploadFile) => publicApi.verifyDocument(file),
  });
}
