// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DocumentIntegrityStatus } from './document-integrity-status';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function showStatus(mockMode = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><DocumentIntegrityStatus documentId="doc-1" mockMode={mockMode} /></QueryClientProvider>);
}

it('checks the document when opened and displays the result', async () => {
  let resolveResponse: (response: Response) => void = () => {};
  const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveResponse = resolve; }));
  vi.stubGlobal('fetch', fetchMock);
  showStatus();
  expect(screen.getByText('Checking document integrity…')).toBeTruthy();
  resolveResponse(Response.json({ status: 'AUTHENTIC', is_authentic: true }));
  expect(await screen.findByText('Integrity verified')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fdocuments%2Fdoc-1%2Fverify%3Freport%3Dfalse', expect.anything());
});

it('does not treat conflicting results as verified and labels demo results', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: false })));
  showStatus(true);
  expect(await screen.findByText('Unable to check integrity')).toBeTruthy();
  expect(screen.getByText(/Demo result only/)).toBeTruthy();
  expect(screen.queryByText('Integrity verified')).toBeNull();
});

it('warns about a mismatch without calling it a verified file', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'TAMPERED', is_authentic: false })));
  showStatus();
  expect(await screen.findByText('Document integrity warning')).toBeTruthy();
  expect(screen.queryByText('Integrity verified')).toBeNull();
});

it('warns that a missing file was deleted', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'FILE_MISSING', is_authentic: false })));
  showStatus();
  expect(await screen.findByText('Document integrity warning')).toBeTruthy();
  expect(screen.getByText(/stored document file is missing/i)).toBeTruthy();
});

it('offers retry when the check fails', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(Response.json({ status: 'NOT_ANCHORED' }));
  vi.stubGlobal('fetch', fetchMock);
  showStatus();
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.getByText('No integrity record')).toBeTruthy());
});
