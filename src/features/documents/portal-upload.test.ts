import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_SIGNED_PDF_BYTES,
  getRequiredUploadMetadataError,
  getRegisterEntryError,
  getUploadFileError,
  uploadDocument,
} from '@/features/documents/portal-upload';

describe('portal document upload', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the selected book and title through the same-origin proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ document_id: 'doc-1', status: 'QUEUED', message: 'Accepted' }), { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['PDF'], 'original.pdf', { type: 'application/pdf' });

    await uploadDocument({ file, title: 'Deed of Sale', bookId: 'book-1' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/portal/proxy-post?path=%2Fdocuments%2Fupload%3Fbook_id%3Dbook-1%26file_name%3DDeed%2Bof%2BSale');
    expect(options).toMatchObject({ method: 'POST', credentials: 'same-origin' });
    expect((options.body as FormData).get('file')).toBe(file);
  });

  it('sends explicit paper numbers in the upload query when open-book manual numbering is selected', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ document_id: 'doc-1', lifecycle: 'SIGNED' }, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['PDF'], 'original.pdf', { type: 'application/pdf' });

    await uploadDocument({ file, title: 'Deed of Sale', bookId: 'book-1', paperRegister: { docNo: 8, pageNo: 4 } });

    const [url, options] = fetchMock.mock.calls[0];
    const path = new URL(url, 'http://localhost').searchParams.get('path')!;
    expect(path).toContain('doc_no=8');
    expect(path).toContain('page_no=4');
    expect((options.body as FormData).get('file')).toBe(file);
  });

  it('rejects a non-PDF before it can be submitted', () => {
    expect(getUploadFileError(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toBe('Choose a PDF file.');
    expect(getUploadFileError(new File([], 'empty.pdf', { type: 'application/pdf' }))).toBe('Choose a non-empty PDF file.');
    expect(getUploadFileError(new File(['PDF'], 'record.pdf', { type: 'application/pdf' }))).toBeNull();
  });

  it('accepts the 60 MiB boundary and rejects larger PDFs', () => {
    const atLimit = new File(['PDF'], 'record.pdf', { type: 'application/pdf' });
    Object.defineProperty(atLimit, 'size', { value: MAX_SIGNED_PDF_BYTES });
    const overLimit = new File(['PDF'], 'record.pdf', { type: 'application/pdf' });
    Object.defineProperty(overLimit, 'size', { value: MAX_SIGNED_PDF_BYTES + 1 });

    expect(getUploadFileError(atLimit)).toBeNull();
    expect(getUploadFileError(overLimit)).toBe('PDF files must be 60 MiB or smaller.');
  });

  it('requires positive whole register numbers only for manual numbering', () => {
    expect(getRegisterEntryError({ bookId: 'book-1', bookStatus: 'OPEN', manualNumbers: false })).toBeNull();
    expect(getRegisterEntryError({ bookId: 'book-1', bookStatus: 'OPEN', manualNumbers: true })).toBe('Enter the paper register document number.');
    expect(getRegisterEntryError({ bookId: 'book-1', bookStatus: 'CLOSED', manualNumbers: false })).toBe('Enter the paper register document number.');
    expect(getRegisterEntryError({ bookId: 'book-1', bookStatus: 'CLOSED', manualNumbers: true, docNo: '2.5', pageNo: '3' })).toBe('Enter a whole paper register document number.');
    expect(getRegisterEntryError({ bookId: 'book-1', bookStatus: 'CLOSED', manualNumbers: true, docNo: '2', pageNo: '0' })).toBe('Enter a positive paper register page number.');
  });

  it('requires only the supported title and book metadata', () => {
    expect(getRequiredUploadMetadataError({ title: '  ', bookId: '' })).toBe('Enter a document title.');
    expect(getRequiredUploadMetadataError({ title: 'Deed of Sale', bookId: '' })).toBe('Choose a book.');
    expect(getRequiredUploadMetadataError({ title: 'Deed of Sale', bookId: 'book-1' })).toBeNull();
  });

  it('returns the created signed document response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      document_id: 'doc-signed',
      file_name: 'record.pdf',
      lifecycle: 'SIGNED',
      status: null,
      on_chain: false,
      permissions: {},
      created_at: '2026-10-08T10:00:00Z',
    }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const created = await uploadDocument({ file: new File(['PDF'], 'record.pdf', { type: 'application/pdf' }), title: 'Deed of Sale', bookId: 'book-1' });

    expect(created).toMatchObject({ document_id: 'doc-signed', lifecycle: 'SIGNED', status: null });
    expect(fetchMock.mock.calls[0][0]).not.toContain('/upload/processing');
  });

  it('returns the proxy API failure for inline display', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'The PDF is too large.' }), { status: 400 })));

    await expect(uploadDocument({ file: new File(['PDF'], 'record.pdf', { type: 'application/pdf' }), title: 'Deed of Sale', bookId: 'book-1' })).rejects.toThrow('The PDF is too large.');
  });

  it('preserves the documented conflict envelope for upload recovery', async () => {
    const conflict = {
      error_type: 'conflict',
      message: 'A signed copy is still expected for these documents.',
      status_code: 409,
      details: {
        reason: 'READY_FOR_SIGNATURE_EXISTS',
        related_documents: [{
          document_id: 'waiting-1',
          file_name: 'Prepared deed',
          parties: [{ f_name: 'Avery', l_name: 'Reviewer', email: 'avery@example.com', role: 'signer' }],
        }],
        errors: [{ field: 'doc_no', message: 'Document number is required.' }],
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(conflict, { status: 409 })));

    let error: unknown;
    try {
      await uploadDocument({ file: new File(['PDF'], 'record.pdf', { type: 'application/pdf' }), title: 'Deed', bookId: 'book-1' });
    } catch (caught) {
      error = caught;
    }

    expect(error).toHaveProperty('message', conflict.message);
    expect(error).toMatchObject({
      status: 409,
      reason: 'READY_FOR_SIGNATURE_EXISTS',
      details: conflict.details,
      relatedDocuments: [{
        documentId: 'waiting-1',
        fileName: 'Prepared deed',
        parties: [{ name: 'Avery Reviewer', email: 'avery@example.com', role: 'signer' }],
      }],
      validationErrors: conflict.details.errors,
      requiresConfirmation: true,
    });
  });

  it('preserves duplicate document identifiers and validation details', async () => {
    const duplicate = { message: 'This file is already filed.', details: { reason: 'DUPLICATE_FILE', document_id: 'existing-doc', errors: [] } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(duplicate, { status: 409 })));

    let error: unknown;
    try {
      await uploadDocument({ file: new File(['PDF'], 'record.pdf', { type: 'application/pdf' }), title: 'Deed', bookId: 'book-1' });
    } catch (caught) {
      error = caught;
    }

    expect(error).toHaveProperty('message', duplicate.message);
    expect(error).toMatchObject({ status: 409, reason: 'DUPLICATE_FILE', documentId: 'existing-doc', details: duplicate.details, validationErrors: [] });
  });
});
