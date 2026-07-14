import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadDocument } from './portal-upload';

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
});
