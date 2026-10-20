import { readFile } from 'node:fs/promises';
import { afterEach, expect, it, vi } from 'vitest';
import { mockPortalGet, mockPortalMutate } from '@/lib/mocks/portal';
import { GET } from './route';

const sampleDeedFileName = 'sample_scanned_deed_of_sale_app_test.pdf';
const tamperedDeedFileName = 'sample_scanned_deed_of_sale_app_test_tampered.pdf';

afterEach(() => vi.unstubAllEnvs());

type RouteContext = { params: Promise<{ fileName: string }> };

function contextFor(storageUrl: string): RouteContext {
  return {
    params: Promise.resolve({
      fileName: decodeURIComponent(storageUrl.slice('/mock-documents/'.length)),
    }),
  };
}

function uploadMockDocument(fileName: string) {
  const form = new FormData();
  form.append('file', new File(['PDF'], 'original.pdf', { type: 'application/pdf' }));
  return mockPortalMutate(
    'POST',
    `/documents/upload?book_id=mock-book-1&file_name=${encodeURIComponent(fileName)}`,
    new Request('http://localhost/api/portal/proxy-post', { method: 'POST', body: form }),
    'mock-token:mock-document-issuer',
  );
}

it('serves a seeded mock extraction source as a renderable one-page PDF', async () => {
  const fileLinkResponse = mockPortalGet(
    '/documents/mock-document-2/file',
    'mock-token:mock-document-issuer',
  );
  const fileLink = await fileLinkResponse.json() as { url: string };

  const response = await GET(
    new Request(`http://localhost${fileLink.url}`),
    contextFor(fileLink.url),
  );

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('application/pdf');
  expect(response.headers.get('content-disposition')).toBe(
    'inline; filename="lexchain-mock-document.pdf"',
  );

  const source = new Uint8Array(await response.arrayBuffer());
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({ data: source });
  const document = await loadingTask.promise;

  expect(document.numPages).toBe(1);
  await loadingTask.destroy();
}, 10_000);

it('uses the exact scanned deed PDF and matching three-page mock extraction after upload', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  vi.stubEnv('USE_MOCK_API', 'false');
  const sampleBytes = await readFile(`docs/scanned-docx-for-testing/${sampleDeedFileName}`);
  const form = new FormData();
  form.append('file', new File([sampleBytes], sampleDeedFileName, { type: 'application/pdf' }));
  const upload = await mockPortalMutate(
    'POST',
    '/documents/upload?book_id=mock-book-1&file_name=Pitch%20Test%20Deed',
    new Request('http://localhost/api/portal/proxy-post', { method: 'POST', body: form }),
    'mock-token:mock-document-issuer',
  );
  const uploaded = await upload.json() as {
    document_id: string;
    lifecycle?: string;
    status?: string | null;
  };
  const { document_id: documentId } = uploaded;
  vi.resetModules();
  const independentMockRoute = await import('@/lib/mocks/portal');
  const documents = await independentMockRoute.mockPortalGet(
    '/documents/',
    'mock-token:mock-document-issuer',
  ).json() as Array<{ id: string }>;
  const detail = await independentMockRoute.mockPortalGet(
    `/documents/${documentId}`,
    'mock-token:mock-document-issuer',
  ).json() as { storage_url: string; book_id: string };
  const extraction = await independentMockRoute.mockPortalGet(
    `/documents/${documentId}/extraction`,
    'mock-token:mock-document-issuer',
  ).json() as { page_count: number; blocks: Array<{ text: string }> };

  expect(upload.status).toBe(201);
  expect(uploaded.lifecycle).toBe('SIGNED');
  expect(uploaded.status).toBe('READY_FOR_REVIEW');
  expect(documents.some((document) => document.id === documentId)).toBe(true);
  expect(detail.book_id).toBe('mock-book-1');
  expect(detail.storage_url).toBe(`/mock-documents/${sampleDeedFileName}`);
  expect(extraction.page_count).toBe(3);
  expect(extraction.blocks.map((block) => block.text)).toContain('DEED OF ABSOLUTE SALE');

  const response = await GET(
    new Request(`http://localhost${detail.storage_url}`, {
      headers: { cookie: 'portal_token=mock-token%3Amock-document-issuer' },
    }),
    contextFor(detail.storage_url),
  );
  expect(response.status).toBe(200);
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(sampleBytes));
}, 10_000);

it('serves the exact tampered deed PDF for the mock blockchain demo', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  vi.stubEnv('USE_MOCK_API', 'false');
  const sampleBytes = await readFile(`docs/scanned-docx-for-testing/${tamperedDeedFileName}`);

  const response = await GET(
    new Request(`http://localhost/mock-documents/${tamperedDeedFileName}`, {
      headers: { cookie: 'portal_token=mock-token%3Amock-document-issuer' },
    }),
    { params: Promise.resolve({ fileName: tamperedDeedFileName }) },
  );

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('application/pdf');
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(Buffer.compare(Buffer.from(await response.arrayBuffer()), sampleBytes)).toBe(0);
}, 30_000);

it.each([
  [sampleDeedFileName, 'false', 'portal_token=mock-token%3Amock-document-issuer'],
  [tamperedDeedFileName, 'false', 'portal_token=mock-token%3Amock-document-issuer'],
  [sampleDeedFileName, 'true', ''],
  [tamperedDeedFileName, 'true', ''],
])('does not serve %s when mock mode is %s and the session is %s', async (fileName, mockMode, cookie) => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', mockMode);
  vi.stubEnv('USE_MOCK_API', 'false');
  const response = await GET(
    new Request(`http://localhost/mock-documents/${fileName}`, {
      headers: cookie ? { cookie } : undefined,
    }),
    { params: Promise.resolve({ fileName }) },
  );

  expect(response.status).toBe(404);
});

it('keeps an extensionless mock upload title behind a PDF storage URL', async () => {
  const upload = await uploadMockDocument('Deed of Sale');
  const { document_id: documentId } = await upload.json() as { document_id: string };
  const detail = await mockPortalGet(
    `/documents/${documentId}`,
    'mock-token:mock-document-issuer',
  ).json() as { storage_url: string };

  expect(detail.storage_url).toMatch(/^\/mock-documents\/.*\.pdf$/i);
  const response = await GET(
    new Request(`http://localhost${detail.storage_url}`),
    contextFor(detail.storage_url),
  );
  expect(response.status).toBe(200);
});

it('serves an extensionless upload title at the 255-character PDF boundary', async () => {
  const title = 'c'.repeat(251);
  const upload = await uploadMockDocument(title);
  expect(upload.status).toBe(201);
  const { document_id: documentId } = await upload.json() as { document_id: string };
  const detail = await mockPortalGet(
    `/documents/${documentId}`,
    'mock-token:mock-document-issuer',
  ).json() as { storage_url: string };

  expect(detail.storage_url).toBe(`/mock-documents/${title}.pdf`);
  const response = await GET(
    new Request(`http://localhost${detail.storage_url}`),
    contextFor(detail.storage_url),
  );
  expect(response.status).toBe(200);
});

it('rejects mock upload titles that cannot form one safe PDF path segment', async () => {
  const response = await uploadMockDocument('bad/name');

  expect(response.status).toBe(400);
});

it('rejects an overlong upload title before it can create an unreachable storage URL', async () => {
  const before = await mockPortalGet(
    '/documents/',
    'mock-token:mock-document-issuer',
  ).json() as Array<{ storage_url: string }>;
  const response = await uploadMockDocument('a'.repeat(252));
  const after = await mockPortalGet(
    '/documents/',
    'mock-token:mock-document-issuer',
  ).json() as Array<{ storage_url: string }>;

  expect(response.status).toBe(400);
  expect(after).toHaveLength(before.length);
});

it('keeps an extensionless mock version title behind a PDF storage URL', async () => {
  const upload = await uploadMockDocument('Draft record.pdf');
  const { document_id: documentId } = await upload.json() as { document_id: string };
  const form = new FormData();
  form.append('file', new File(['PDF'], 'updated.pdf', { type: 'application/pdf' }));
  const update = await mockPortalMutate(
    'POST',
    `/documents/${documentId}/update?file_name=Updated%20record`,
    new Request('http://localhost/api/portal/proxy-post', { method: 'POST', body: form }),
    'mock-token:mock-document-issuer',
  );
  const { document_id: versionId } = await update.json() as { document_id: string };
  const detail = await mockPortalGet(
    `/documents/${versionId}`,
    'mock-token:mock-document-issuer',
  ).json() as { storage_url: string };

  expect(detail.storage_url).toMatch(/^\/mock-documents\/.*\.pdf$/i);
  const response = await GET(
    new Request(`http://localhost${detail.storage_url}`),
    contextFor(detail.storage_url),
  );
  expect(response.status).toBe(200);
});

it('rejects an overlong version title without appending an unreachable version', async () => {
  const upload = await uploadMockDocument('Version boundary.pdf');
  const { document_id: documentId } = await upload.json() as { document_id: string };
  const form = new FormData();
  form.append('file', new File(['PDF'], 'updated.pdf', { type: 'application/pdf' }));
  const response = await mockPortalMutate(
    'POST',
    `/documents/${documentId}/update?file_name=${encodeURIComponent('b'.repeat(252))}`,
    new Request('http://localhost/api/portal/proxy-post', { method: 'POST', body: form }),
    'mock-token:mock-document-issuer',
  );
  const history = await mockPortalGet(
    `/documents/${documentId}/versions`,
    'mock-token:mock-document-issuer',
  ).json() as { total_version: number };

  expect(response.status).toBe(400);
  expect(history.total_version).toBe(1);
});

it.each([
  ['non-PDF', 'notes.txt'],
  ['path separator', '../secret.pdf'],
  ['control character', 'unsafe\nname.pdf'],
  ['surrounding whitespace', ' report.pdf'],
  ['overlong value', `${'a'.repeat(252)}.pdf`],
])('rejects a %s mock document name without reflecting it into headers', async (_case, fileName) => {
  const response = await GET(
    new Request('http://localhost/mock-documents/invalid'),
    { params: Promise.resolve({ fileName }) },
  );

  expect(response.status).toBe(404);
  expect(response.headers.get('content-disposition')).toBeNull();
});
