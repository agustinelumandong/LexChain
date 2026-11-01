import { afterEach, expect, it, vi } from 'vitest';
import { createWatermarkedSignedPdf } from './watermark-signed-pdf';

afterEach(() => vi.unstubAllGlobals());

it('preserves a preview already watermarked by the backend', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('preview bytes', { headers: { 'X-LexChain-Watermarked': 'true' } })));
  expect(new TextDecoder().decode(await createWatermarkedSignedPdf('/preview'))).toBe('preview bytes');
});
