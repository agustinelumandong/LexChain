import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

afterEach(() => vi.restoreAllMocks());

it('does not resend participant invitation when the authenticated profile is not a lawyer', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ role: 'document_participant' }), { status: 200 }),
  );
  vi.stubGlobal('fetch', fetchMock);

  const response = await POST(
    new NextRequest('http://localhost/api/portal/documents/document-123/parties/party-456/resend', {
      method: 'POST',
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123', partyUserId: 'party-456' }) },
  );

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({ message: 'Participant management is available to Lawyers only.' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('/users/', {
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
});

it('resends participant invitation when the authenticated profile is a lawyer', async () => {
  const updatedParty = {
    id: 'party-456',
    user_id: null,
    email: 'newcomer@example.com',
    role: 'viewer',
    status: 'pending',
    expires_at: '2026-11-10T08:12:00Z',
  };
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ role: 'document_issuer' }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(updatedParty), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  const response = await POST(
    new NextRequest('http://localhost/api/portal/documents/document-123/parties/party-456/resend', {
      method: 'POST',
      headers: { cookie: 'portal_token=portal-token' },
    }),
    { params: Promise.resolve({ id: 'document-123', partyUserId: 'party-456' }) },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(updatedParty);
  expect(fetchMock).toHaveBeenLastCalledWith('/documents/document-123/parties/party-456/resend', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer portal-token',
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
});
