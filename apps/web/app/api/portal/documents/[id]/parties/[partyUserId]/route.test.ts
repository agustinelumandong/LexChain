import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from './route';

afterEach(() => vi.restoreAllMocks());

it('does not revoke participant access when the authenticated profile is not an issuer', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ role: 'user' }), { status: 200 }),
  );
  vi.stubGlobal('fetch', fetchMock);

  const response = await DELETE(
    new NextRequest('http://localhost/api/portal/documents/document-123/parties/person-456', {
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123', partyUserId: 'person-456' }) },
  );

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({ message: 'Participant management is available to Document Issuers only.' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('/users/', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
});
