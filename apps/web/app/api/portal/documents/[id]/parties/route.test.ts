import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const originalApiUrl = process.env.API_URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

it('rejects unauthenticated requests and forwards an authenticated party list request', async () => {
  const params = Promise.resolve({ id: 'document-123' });

  const unauthenticated = await GET(
    new NextRequest('http://localhost/api/portal/documents/document-123/parties'),
    { params },
  );

  expect(unauthenticated.status).toBe(401);
  await expect(unauthenticated.json()).resolves.toEqual({ message: 'Not authenticated' });

  const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ parties: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);

  const authenticated = await GET(
    new NextRequest('http://localhost/api/portal/documents/document-123/parties', {
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params },
  );

  expect(fetchMock).toHaveBeenCalledWith('/documents/document-123/parties', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
  expect(authenticated.status).toBe(200);
  await expect(authenticated.json()).resolves.toEqual({ parties: [] });
});
