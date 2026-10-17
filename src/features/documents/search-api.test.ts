import { afterEach, expect, it, vi } from 'vitest';
import { searchDocument, searchPortalDocuments } from './search-api';

afterEach(() => vi.unstubAllGlobals());

it.each([
  ['global', () => searchPortalDocuments('deed')],
  ['document', () => searchDocument('doc-1', 'deed')],
] as const)('retains backend message, status and details for %s search', async (_scope, search) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
    message: 'Search unavailable', details: { reason: 'INDEX_PENDING' },
  }, { status: 503 })));
  await expect(search()).rejects.toMatchObject({ message: 'Search unavailable', status: 503, details: { reason: 'INDEX_PENDING' } });
});

it('preserves global and document search encoding and cache options', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => Response.json({ results: [] }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(searchPortalDocuments('  deed  ')).resolves.toEqual({ results: [] });
  await expect(searchDocument(' a/b ', '  deed  ')).resolves.toEqual({ results: [] });
  expect(fetchMock.mock.calls).toEqual([
    ['/api/portal/proxy-post?path=%2Fsearch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"query":"  deed  "}', credentials: 'same-origin' }],
    ['/api/portal/proxy-post?path=%2Fdocuments%2Fa%252Fb%2Fsearch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"query":"deed"}', credentials: 'same-origin', cache: 'no-store' }],
  ]);
});

it('rejects blank document search input before networking', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  await expect(searchDocument(' ', 'deed')).rejects.toThrow('Document ID is required');
  await expect(searchDocument('doc-1', ' ')).rejects.toThrow('Search query is required');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('shares one logout and login navigation across unauthorized document helpers', async () => {
  vi.resetModules();
  const replace = vi.fn();
  vi.stubGlobal('window', { location: { replace } });
  const fetchMock = vi.fn().mockImplementation(async (url: string) => url === '/api/portal/logout'
    ? new Response(null, { status: 204 })
    : Response.json({ message: 'Session expired', details: { reason: 'EXPIRED' } }, { status: 401 }));
  vi.stubGlobal('fetch', fetchMock);
  const { createGoogleDraft } = await import('./document-draft-api');
  const { markDocumentReady, attachSignedCopy } = await import('./document-lifecycle-api');
  const { getExtractionReview } = await import('./extraction-api');
  const { uploadDocument } = await import('./portal-upload');
  const { searchDocument, searchPortalDocuments } = await import('./search-api');
  const file = new File(['PDF'], 'record.pdf');
  const outcomes = await Promise.allSettled([
    createGoogleDraft('doc-1', 'blank'), markDocumentReady('doc-1'), getExtractionReview('doc-1'),
    uploadDocument({ file, title: 'Deed', bookId: 'book-1' }), searchDocument('doc-1', 'deed'),
    searchPortalDocuments('deed'), attachSignedCopy('doc-1', file, { bookId: 'book-1' }),
  ]);
  for (const outcome of outcomes) {
    expect(outcome).toMatchObject({ status: 'rejected', reason: { message: 'Session expired', status: 401, details: { reason: 'EXPIRED' } } });
  }
  expect(fetchMock.mock.calls.filter(([url]) => url === '/api/portal/logout')).toEqual([
    ['/api/portal/logout', { method: 'POST', credentials: 'same-origin' }],
  ]);
  expect(replace).toHaveBeenCalledExactlyOnceWith('/login');
});
