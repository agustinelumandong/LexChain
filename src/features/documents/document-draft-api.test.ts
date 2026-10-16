import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGoogleDraft } from '@/features/documents/document-draft-api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createGoogleDraft errors', () => {
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
