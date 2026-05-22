import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from '@lexchain/types/openapi';

import { env, requireApiUrl } from '@/shared/config';
import { authTokenStorage } from '@/shared/utils/secure-storage';
import { handleExpiredSession } from '@/features/auth/session-expiration';

const baseUrl = env.useMockApi ? '' : requireApiUrl().replace(/\/$/, '');

function getBearerToken(request: Request) {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length);
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await authTokenStorage.get();

    if (token && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  },
  async onResponse({ request, response }) {
    if (response.status === 401) {
      await handleExpiredSession(getBearerToken(request));
    }

    return response;
  },
};

export const openApiClient = createClient<paths>({ baseUrl });

openApiClient.use(authMiddleware);
