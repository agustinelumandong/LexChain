import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from './generated/schema';

import { env, requireApiUrl } from '@/shared/config';
import { authTokenStorage } from '@/shared/utils/secure-storage';

const baseUrl = env.useMockApi ? '' : requireApiUrl().replace(/\/$/, '');

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await authTokenStorage.get();

    if (token && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  },
};

export const openApiClient = createClient<paths>({ baseUrl });

openApiClient.use(authMiddleware);
