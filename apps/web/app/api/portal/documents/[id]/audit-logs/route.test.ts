import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const originalApiUrl = process.env.API_URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

it('does not proxy audit logs when the authenticated profile is not an issuer', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ role: 'user' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);

  const response = await GET(
    new NextRequest('http://localhost/api/portal/documents/document-123/audit-logs', {
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123' }) },
  );

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({ message: 'Document activity is available to Document Issuers only.' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('/users/', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
});

it('proxies audit logs after the authenticated profile confirms an issuer', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ role: 'lawyer' }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'audit-1' }]), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  const response = await GET(
    new NextRequest('http://localhost/api/portal/documents/document-123/audit-logs', {
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123' }) },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([{ id: 'audit-1' }]);
  expect(fetchMock).toHaveBeenLastCalledWith('/documents/document-123/audit-logs', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
});
