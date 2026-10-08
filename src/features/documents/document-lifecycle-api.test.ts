import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  finalizeDocument,
  listDraftComments,
  listDemoSnapshots,
  markDocumentReady,
  reopenDocument,
  restoreDemoSnapshot,
  syncDraftComments,
} from '@/features/documents/document-lifecycle-api';

const record = {
  document_id: 'document-1',
  tx_hash: '0xtxhash',
  onchain_document_id: 'onchain-document-1',
  data_hash: 'datahash',
};

const lifecycle = {
  lifecycle: 'finalized',
  document_hash: 'a'.repeat(64),
  finalized_at: '2026-07-26T00:00:00.000Z',
  finalized_by: 'issuer-1',
  anchor_status: 'confirmed',
  snapshots: [{
    id: 'snapshot-1',
    document_id: 'document-1',
    text_hash: 'a'.repeat(64),
    created_at: '2026-07-26T00:00:00.000Z',
  }],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('document lifecycle client', () => {
  it('lists and synchronizes comments through the same-origin proxies', async () => {
    const comments = { document_id: 'document-1', unresolved: 1, comments: [] };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(comments))
      .mockResolvedValueOnce(Response.json(comments));
    vi.stubGlobal('fetch', fetchMock);

    await expect(listDraftComments('document-1')).resolves.toEqual(comments);
    await expect(syncDraftComments('document-1')).resolves.toEqual(comments);

    expect(fetchMock).toHaveBeenNthCalledWith(1,
      '/api/portal/proxy?path=%2Fdocuments%2Fdocument-1%2Fcomments',
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2,
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fcomments%2Fsync',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('moves documents to and from ready for signature via backend mutations', async () => {
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

  it('finalizes through the existing same-origin mutation proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(record));
    vi.stubGlobal('fetch', fetchMock);

    await expect(finalizeDocument('document-1')).resolves.toEqual(record);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Ffinalize',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('lists snapshots through the existing same-origin read proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(lifecycle.snapshots));
    vi.stubGlobal('fetch', fetchMock);

    await expect(listDemoSnapshots('document-1')).resolves.toEqual(lifecycle.snapshots);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy?path=%2Fdocuments%2Fdocument-1%2Fsnapshots',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
  });

  it('restores a snapshot with the required reason through the mutation proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ...lifecycle, lifecycle: 'restored' }));
    vi.stubGlobal('fetch', fetchMock);

    await restoreDemoSnapshot('document-1', 'snapshot-1', 'Restore the reviewed text.');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fsnapshots%2Fsnapshot-1%2Frestore',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reason: 'Restore the reviewed text.' }),
      }),
    );
  });

  it.each([
    ['finalize document ID', () => finalizeDocument('  '), 'Document ID is required'],
    ['snapshot-list document ID', () => listDemoSnapshots(''), 'Document ID is required'],
    ['restore document ID', () => restoreDemoSnapshot('', 'snapshot-1', 'Reason'), 'Document ID is required'],
    ['restore snapshot ID', () => restoreDemoSnapshot('document-1', ' ', 'Reason'), 'Snapshot ID is required'],
    ['restore reason', () => restoreDemoSnapshot('document-1', 'snapshot-1', '  '), 'Restoration reason is required'],
  ])('rejects a blank %s before fetching', async (_label, request, message) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(request()).rejects.toThrow(message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves the message returned by the mock lifecycle endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ message: 'Document cannot be finalized' }, { status: 400 }),
    ));

    await expect(finalizeDocument('document-1')).rejects.toThrow('Document cannot be finalized');
  });
});
