import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const originalApiUrl = process.env.API_URL;
const originalMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
  if (originalMockApi === undefined) delete process.env.NEXT_PUBLIC_USE_MOCK_API;
  else process.env.NEXT_PUBLIC_USE_MOCK_API = originalMockApi;
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

it('returns the seeded integrity mismatch in mock mode without calling the backend', async () => {
  process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const response = await GET(
    new NextRequest('http://localhost/api/portal/blockchain/verify/mock-document-3', {
      headers: { cookie: 'portal_token=mock-token:mock-lawyer' },
    }),
    { params: Promise.resolve({ id: 'mock-document-3' }) },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(expect.objectContaining({
    document_id: 'mock-document-3',
    data_hash: '0xmockdatahash',
    is_verified: false,
  }));
  expect(fetchMock).not.toHaveBeenCalled();
});
