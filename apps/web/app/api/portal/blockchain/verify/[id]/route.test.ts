import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const originalApiUrl = process.env.API_URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

it('rejects unauthenticated blockchain verification requests', async () => {
  const response = await GET(
    new NextRequest('http://localhost/api/portal/blockchain/verify/document-123'),
    { params: Promise.resolve({ id: 'document-123' }) },
  );

  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({ message: 'Not authenticated' });
});

it('forwards authenticated blockchain verification requests to the matching upstream path', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ document_id: 'document-123', data_hash: 'hash' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);

  const response = await GET(
    new NextRequest('http://localhost/api/portal/blockchain/verify/document-123', {
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123' }) },
  );

  expect(fetchMock).toHaveBeenCalledWith('/blockchain/verify/document-123', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ document_id: 'document-123', data_hash: 'hash' });
});
