import type { PickedUploadFile } from '@/types';

import type { components } from './generated/schema';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockPublicApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type PublicVerifyResponse = ApiSchema<'PublicVerifyResponse'>;

function createVerifyForm(file: PickedUploadFile) {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/pdf',
  } as unknown as Blob);

  return formData;
}

export const publicApi = {
  verifyDocument: (file: PickedUploadFile) => {
    if (env.useMockApi) {
      return mockPublicApi.verifyDocument(file);
    }

    return apiClient.post<PublicVerifyResponse>('/public/verify', createVerifyForm(file), {
      auth: false,
    });
  },
};
