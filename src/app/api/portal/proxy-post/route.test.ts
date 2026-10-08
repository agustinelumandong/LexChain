import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, PUT } from './route';

const { isMockModeMock } = vi.hoisted(() => ({ isMockModeMock: vi.fn(() => false) }));

vi.mock('@/server/api/backend', () => ({ backendUrl: (path: string) => `https://backend.example${path}` }));
vi.mock('@/lib/mocks/mode', () => ({ isMockMode: isMockModeMock }));

afterEach(() => {
  vi.unstubAllGlobals();
  isMockModeMock.mockReturnValue(false);
});

describe('/api/portal/proxy-post signed-copy requests', () => {
  it('forwards replacement multipart data with PUT and the server-held token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ document_id: 'document-1' }));
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.set('file', new File(['signed pdf'], 'signed.pdf', { type: 'application/pdf' }));
    form.set('reason', 'Corrected scan');
    const request = new NextRequest('http://localhost/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy', {
      method: 'PUT',
      headers: { cookie: 'portal_token=secret-token' },
      body: form,
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example/documents/document-1/signed-copy',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer secret-token' }),
        body: expect.any(Blob),
      }),
    );
  });

  it('rejects a signed-copy replacement without a reason before forwarding', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.set('file', new File(['signed pdf'], 'signed.pdf', { type: 'application/pdf' }));
    const request = new NextRequest('http://localhost/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy', {
      method: 'PUT',
      headers: { cookie: 'portal_token=secret-token' },
      body: form,
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an attachment without its PDF before forwarding', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    const request = new NextRequest('http://localhost/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy%3Fbook_id%3Dbook-1', {
      method: 'POST',
      headers: { cookie: 'portal_token=secret-token' },
      body: form,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports signed-copy operations as unavailable in demo mode', async () => {
    isMockModeMock.mockReturnValue(true);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.set('file', new File(['signed pdf'], 'signed.pdf', { type: 'application/pdf' }));
    const request = new NextRequest('http://localhost/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy%3Fbook_id%3Dbook-1', {
      method: 'POST',
      headers: { cookie: 'portal_token=mock-token:mock-document-issuer' },
      body: form,
    });

    const response = await POST(request);

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({ message: 'Signed-copy operations are unavailable in demo mode' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
