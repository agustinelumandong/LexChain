import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const { backendUrlMock, isMockModeMock, mockPortalGetMock } = vi.hoisted(() => ({
  backendUrlMock: vi.fn((path: string) => `https://backend.example${path}`),
  isMockModeMock: vi.fn(() => false),
  mockPortalGetMock: vi.fn(),
}));

vi.mock('@/server/api/backend', () => ({ backendUrl: backendUrlMock }));
vi.mock('@/lib/mocks/mode', () => ({ isMockMode: isMockModeMock }));
vi.mock('@/lib/mocks/portal', () => ({
  isMockPortalToken: vi.fn(() => true),
  mockPortalGet: mockPortalGetMock,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  isMockModeMock.mockReturnValue(false);
});

it('streams the authorized signed PDF inline through the same-origin route', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ url: 'https://storage.example/signed.pdf', expires_in: 300 }))
    .mockResolvedValueOnce(new Response('pdf bytes', { headers: { 'content-type': 'application/pdf' } }));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('http://localhost/api/portal/documents/doc-1/file', {
    headers: { cookie: 'portal_token=real-token' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('application/pdf');
  expect(response.headers.get('content-disposition')).toContain('inline');
  expect(response.headers.get('cache-control')).toContain('no-store');
  await expect(response.text()).resolves.toBe('pdf bytes');
  expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://backend.example/documents/doc-1/file', expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer real-token' }),
  }));
  expect(new Headers(fetchMock.mock.calls[1][1]?.headers).has('cookie')).toBe(false);
});

it('requests the selected historical copy and marks the response as a download', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ url: 'https://storage.example/old.pdf', expires_in: 300 }))
    .mockResolvedValueOnce(new Response('pdf bytes', { headers: { 'content-type': 'application/pdf' } }));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('http://localhost/api/portal/documents/doc-1/file?copy_id=copy-old&download=1&filename=old%20copy.pdf', {
    headers: { cookie: 'portal_token=real-token' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(fetchMock.mock.calls[0][0]).toBe('https://backend.example/documents/doc-1/file?copy_id=copy-old');
  expect(response.headers.get('content-disposition')).toContain('attachment');
  expect(response.headers.get('content-disposition')).toContain('old%20copy.pdf');
});

it('preserves backend authorization errors without trying to fetch a file', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ detail: 'Document access required' }, { status: 403 }));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('http://localhost/api/portal/documents/doc-1/file', {
    headers: { cookie: 'portal_token=real-token' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(response.status).toBe(403);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await expect(response.json()).resolves.toEqual({ detail: 'Document access required' });
});

it('requires the portal session before requesting a signed URL', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('http://localhost/api/portal/documents/doc-1/file');

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(response.status).toBe(401);
  expect(fetchMock).not.toHaveBeenCalled();
});

it('streams mock PDFs from the mock file link without calling the live backend', async () => {
  isMockModeMock.mockReturnValue(true);
  mockPortalGetMock.mockReturnValue(Response.json({
    document_id: 'doc-1',
    copy_id: 'doc-1',
    url: '/mock-documents/sample.pdf',
    expires_in: 300,
  }));
  const fetchMock = vi.fn().mockResolvedValue(new Response('mock pdf bytes', { headers: { 'content-type': 'application/pdf' } }));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('http://localhost/api/portal/documents/doc-1/file', {
    headers: { cookie: 'portal_token=mock-token:mock-document-issuer' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(mockPortalGetMock).toHaveBeenCalledWith('/documents/doc-1/file', 'mock-token:mock-document-issuer');
  expect(fetchMock).toHaveBeenCalledWith(new URL('/mock-documents/sample.pdf', request.nextUrl.origin), expect.objectContaining({
    headers: expect.any(Headers),
  }));
  expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('cookie')).toBe('portal_token=mock-token:mock-document-issuer');
  await expect(response.text()).resolves.toBe('mock pdf bytes');
});

it.each([
  ['unencrypted remote URL', 'http://storage.example/signed.pdf'],
  ['IP address', 'https://127.0.0.1/private.pdf'],
  ['embedded credentials', 'https://user:pass@storage.example/signed.pdf'],
])('rejects a signed URL with an unsafe %s without fetching it', async (_label, url) => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ url, expires_in: 300 }));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('https://app.example/api/portal/documents/doc-1/file', {
    headers: { cookie: 'portal_token=real-token' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(response.status).toBe(502);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('does not follow redirects from a signed storage URL', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ url: 'https://storage.example/signed.pdf', expires_in: 300 }))
    .mockRejectedValueOnce(new TypeError('redirect rejected'));
  vi.stubGlobal('fetch', fetchMock);
  const request = new NextRequest('https://app.example/api/portal/documents/doc-1/file', {
    headers: { cookie: 'portal_token=real-token' },
  });

  const response = await GET(request, { params: Promise.resolve({ id: 'doc-1' }) });

  expect(response.status).toBe(502);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ redirect: 'error' }));
});