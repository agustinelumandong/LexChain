import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  attachSignedCopy,
  cancelDocument,
  correctDocumentEntry,
  finalizeDocument,
  listDraftComments,
  replaceSignedCopy,
  markDocumentReady,
  reopenDocument,
  syncDraftComments,
} from '@/features/documents/document-lifecycle-api';

const record = {
  document_id: 'document-1',
  tx_hash: '0xtxhash',
  onchain_document_id: 'onchain-document-1',
  data_hash: 'datahash',
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('document lifecycle client', () => {
  it('corrects the register entry through the OpenAPI PATCH operation', async () => {
    const response = { document_id: 'document-1', lifecycle: 'SIGNED', doc_no: 14, page_no: 9 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(correctDocumentEntry('document-1', { book_id: 'book-2', doc_no: 14, page_no: 9 })).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fentry',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ book_id: 'book-2', doc_no: 14, page_no: 9 }),
      }),
    );
  });

  it('rejects non-positive register numbers without sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(Promise.resolve().then(() => correctDocumentEntry('document-1', { doc_no: 0, page_no: 1 }))).rejects.toThrow('Document number must be a positive whole number.');
    await expect(Promise.resolve().then(() => correctDocumentEntry('document-1', { doc_no: 1, page_no: 0 }))).rejects.toThrow('Page number must be a positive whole number.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('attaches a signed PDF with filing details using multipart form data', async () => {
    const response = { document_id: 'document-1', lifecycle: 'SIGNED' };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['signed pdf'], 'signed.pdf', { type: 'application/pdf' });

    await expect(attachSignedCopy('document-1', file, { bookId: 'book-1', docNo: 12, pageNo: 7 })).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy%3Fbook_id%3Dbook-1%26doc_no%3D12%26page_no%3D7',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
    );
    expect(fetchMock.mock.calls[0][1].body.get('file')).toBe(file);
  });

  it('preserves the structured backend error for a failed signed-copy attachment', async () => {
    const payload = { message: 'The waiting document rejected this file.', details: { reason: 'INVALID_SIGNED_COPY', errors: [{ field: 'file', message: 'Invalid signature.' }] } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(payload, { status: 422 })));

    await expect(attachSignedCopy('document-1', new File(['pdf'], 'signed.pdf'), { bookId: 'book-1' })).rejects.toMatchObject({
      message: payload.message,
      status: 422,
      reason: 'INVALID_SIGNED_COPY',
      details: payload.details,
      validationErrors: payload.details.errors,
    });
  });

  it('replaces a signed PDF with a reason using PUT multipart form data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ document_id: 'document-1', lifecycle: 'SIGNED' }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['corrected pdf'], 'corrected.pdf', { type: 'application/pdf' });

    await replaceSignedCopy('document-1', file, 'Corrected notarial page');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsigned-copy',
      expect.objectContaining({ method: 'PUT', body: expect.any(FormData) }),
    );
    const form = fetchMock.mock.calls[0][1].body as FormData;
    expect(form.get('file')).toBe(file);
    expect(form.get('reason')).toBe('Corrected notarial page');
  });

  it('rejects a blank replacement reason before sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(Promise.resolve().then(() => replaceSignedCopy('document-1', new File(['pdf'], 'signed.pdf'), '  '))).rejects.toThrow('Replacement reason is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lists and synchronizes comments through the same-origin proxies', async () => {
    const comments = { document_id: 'document-1', unresolved: 1, comments: [] };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(comments))
      .mockResolvedValueOnce(Response.json(comments));
    vi.stubGlobal('fetch', fetchMock);

    await expect(listDraftComments('document-1')).resolves.toEqual(comments);
    await expect(syncDraftComments('document-1')).resolves.toEqual(comments);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/portal/proxy?path=%2Fdocuments%2Fdocument-1%2Fcomments',
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fcomments%2Fsync',
    ]);
  });

  it('marks ready and reopens through permission-enforced backend mutations', async () => {
    const response = { document_id: 'document-1', lifecycle: 'READY_FOR_SIGNATURE' };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(response))
      .mockResolvedValueOnce(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(markDocumentReady('document-1')).resolves.toEqual(response);
    await expect(reopenDocument('document-1')).resolves.toEqual(response);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fready',
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Freopen',
    ]);
  });

  it('cancels a document through the OpenAPI POST operation', async () => {
    const response = { document_id: 'document-1', lifecycle: 'CANCELLED' };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(cancelDocument('document-1')).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fcancel',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('preserves the backend reason when readiness is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ detail: 'UNRESOLVED_COMMENTS: resolve all threads' }, { status: 409 }),
    ));

    await expect(markDocumentReady('document-1')).rejects.toThrow('UNRESOLVED_COMMENTS: resolve all threads');
  });

  it('preserves validated unresolved-comment details and readable legacy errors', async () => {
    const message = 'Resolve the remaining comments before marking ready.';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({ message, details: {
        reason: 'UNRESOLVED_COMMENTS', unresolved: 2, draft_url: 'https://docs.google.com/document/d/example',
      } }, { status: 409 }))
      .mockResolvedValueOnce(Response.json({ message, details: {
        reason: 'UNRESOLVED_COMMENTS', unresolved: -1, draft_url: 'https://evil.example/document',
      } }, { status: 409 }))
      .mockResolvedValueOnce(Response.json({ detail: 'Legacy readiness failure' }, { status: 409 }))
      .mockResolvedValueOnce(new Response('not json', { status: 503 })));

    await expect(markDocumentReady('document-1')).rejects.toMatchObject({
      name: 'LifecycleRequestError', message, status: 409, reason: 'UNRESOLVED_COMMENTS', unresolved: 2,
      draftUrl: 'https://docs.google.com/document/d/example',
    });

    try {
      await markDocumentReady('document-1');
      throw new Error('Expected readiness request to fail');
    } catch (error) {
      expect(error).toMatchObject({ message, status: 409, reason: 'UNRESOLVED_COMMENTS' });
      expect(error).not.toHaveProperty('unresolved');
      expect(error).not.toHaveProperty('draftUrl');
    }
    await expect(markDocumentReady('document-1')).rejects.toMatchObject({ message: 'Legacy readiness failure', status: 409 });
    await expect(markDocumentReady('document-1')).rejects.toMatchObject({ message: 'API error: 503', status: 503 });
  });

  it('finalizes through the existing same-origin mutation proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(record));
    vi.stubGlobal('fetch', fetchMock);

    await expect(finalizeDocument('document-1')).resolves.toEqual(record);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Ffinalize',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects a blank document ID before fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(finalizeDocument('  ')).rejects.toThrow('Document ID is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves the message returned by the mock lifecycle endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ message: 'Document cannot be finalized' }, { status: 400 }),
    ));

    await expect(finalizeDocument('document-1')).rejects.toThrow('Document cannot be finalized');
  });
});

it('retains the shared backend message, HTTP status and structured details', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
    message: 'Backend action denied', detail: 'Legacy fallback', details: { reason: 'DENIED', retryable: false },
  }, { status: 403 })));
  await expect(markDocumentReady('document-1')).rejects.toMatchObject({
    message: 'Backend action denied', status: 403, details: { reason: 'DENIED', retryable: false },
  });
});
