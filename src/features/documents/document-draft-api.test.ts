import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGoogleDraft, getGoogleDraftUploadFileError } from '@/features/documents/document-draft-api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createGoogleDraft errors', () => {
  it('sends the selected Google draft source as multipart form data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ draft_url: 'https://docs.google.com/document/d/example' }));
    vi.stubGlobal('fetch', fetchMock);
    await createGoogleDraft('doc-101', 'template', 'file-1');
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get('source')).toBe('template');
    expect((options.body as FormData).get('file_id')).toBe('file-1');
  });

  it('accepts each backend-supported upload extension', () => {
    for (const name of ['agreement.docx', 'agreement.doc', 'agreement.odt', 'agreement.rtf', 'AGREEMENT.DOCX']) {
      expect(getGoogleDraftUploadFileError(new File(['draft'], name))).toBeNull();
    }
    expect(getGoogleDraftUploadFileError(new File([new Uint8Array(10 * 1024 * 1024)], 'maximum.docx'))).toBeNull();
  });

  it.each([
    [new File([], 'empty.docx'), 'Choose a non-empty document file.'],
    [new File(['image'], 'renamed.pdf'), 'Choose a .docx, .doc, .odt, or .rtf file.'],
    [new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.docx'), 'Choose a file that is 10 MiB or smaller.'],
  ])('rejects an unsupported upload before calling the backend', async (file, message) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(getGoogleDraftUploadFileError(file as File)).toBe(message);
    await expect(createGoogleDraft('doc-101', 'upload', undefined, file as File)).rejects.toThrow(message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends an uploaded source and file through the multipart proxy without setting a boundary', async () => {
    const file = new File(['word content'], 'client-contract.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ draft_url: 'https://docs.google.com/document/d/example' }));
    vi.stubGlobal('fetch', fetchMock);

    await createGoogleDraft('doc-101', 'upload', undefined, file);

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-101%2Fdraft');
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get('source')).toBe('upload');
    expect((options.body as FormData).get('file')).toBe(file);
    expect((options.body as FormData).has('file_id')).toBe(false);
    expect(options.headers).toBeUndefined();
  });
  it.each(['GOOGLE_NOT_CONNECTED', 'GOOGLE_RECONNECT_REQUIRED'])(
    'exposes %s from details.reason while retaining status and message',
    async (reason) => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json({
        message: 'Reconnect Google Drive to continue.',
        details: { reason },
      }, { status: 409 })));

      await expect(createGoogleDraft('doc-101', 'blank')).rejects.toMatchObject({
        status: 409,
        code: reason,
        message: 'Reconnect Google Drive to continue.',
      });
    },
  );

  it('continues to expose a legacy detail error as its code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ detail: 'GOOGLE_NOT_CONNECTED' }, { status: 409 })));

    await expect(createGoogleDraft('doc-101', 'blank')).rejects.toMatchObject({
      status: 409,
      code: 'GOOGLE_NOT_CONNECTED',
      message: 'GOOGLE_NOT_CONNECTED',
    });
  });

  it('uses a generic message when the error has no documented reason', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'Try again later.' }, { status: 503 })));

    await expect(createGoogleDraft('doc-101', 'blank')).rejects.toMatchObject({
      status: 503,
      code: 'Try again later.',
      message: 'Try again later.',
    });
  });
});

it('retains the shared backend message, HTTP status and structured details', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
    message: 'Backend action denied', detail: 'Legacy fallback', details: { reason: 'DENIED', retryable: false },
  }, { status: 403 })));
  await expect(createGoogleDraft('doc-101', 'blank')).rejects.toMatchObject({
    message: 'Backend action denied', status: 403, details: { reason: 'DENIED', retryable: false },
  });
});
