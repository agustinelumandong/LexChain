// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DocumentIntegrityStatus } from './document-integrity-status';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function showStatus(mockMode = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><DocumentIntegrityStatus documentId="doc-1" mockMode={mockMode} /></QueryClientProvider>);
}

it('rechecks an unanchored record and shows the matching result', async () => {
  const response = (metadata_status: string) => Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status, analysis_status: 'MATCH', needs_restore: false });
  const fetchMock = vi.fn().mockResolvedValueOnce(response('NOT_ANCHORED')).mockResolvedValue(response('MATCH'));
  vi.stubGlobal('fetch', fetchMock);
  showStatus();
  expect(await screen.findByText('Checking integrity records…')).toBeTruthy();
  expect(await screen.findByText('PDF and document details unchanged', {}, { timeout: 7000 })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(2);
}, 10000);

it('stops retrying a persistent unanchored record and offers a manual check', async () => {
  vi.useFakeTimers();
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'NOT_ANCHORED', analysis_status: 'MATCH', needs_restore: false })));
  vi.stubGlobal('fetch', fetchMock);
  showStatus();
  for (let i = 0; i < 15; i++) await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
  expect(screen.getByText('No saved document details.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Check again' })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(13);
  fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(50); });
  expect(fetchMock).toHaveBeenCalledTimes(14);
});

it('checks the document when opened and displays the result', async () => {
  let resolveResponse: (response: Response) => void = () => {};
  const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveResponse = resolve; }));
  vi.stubGlobal('fetch', fetchMock);
  showStatus();
  expect(screen.getByText('Checking document integrity…')).toBeTruthy();
  resolveResponse(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'MATCH', analysis_status: 'MATCH', needs_restore: false }));
  expect(await screen.findByText('PDF and document details unchanged')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fdocuments%2Fdoc-1%2Fverify%3Freport%3Dfalse', expect.anything());
});

it('shows a changed file name alongside a matching PDF', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'ALTERED', needs_restore: true, metadata_changes: [{ field: 'file_name', anchored: 'Old name', current: 'New name' }] })));
  showStatus();
  expect(await screen.findByText('File name changed')).toBeTruthy();
  expect(screen.getByText('PDF unchanged')).toBeTruthy();
  expect(screen.getByText('Old name')).toBeTruthy();
  expect(screen.getByText('New name')).toBeTruthy();
  expect(screen.getByText('File name changed').closest('section')?.className).toContain('bg-red-50');
});

it('warns when repair is needed even if both displayed checks match', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'MATCH', needs_restore: true })));
  showStatus();
  expect(await screen.findByText('A record needs attention.')).toBeTruthy();
  expect(screen.queryByText('PDF and document details unchanged')).toBeNull();
});

it('warns when the analysis was altered even if the PDF matches', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'MATCH', analysis_status: 'ALTERED', needs_restore: true })));
  showStatus();
  expect(await screen.findByText('Analysis changed.')).toBeTruthy();
  expect(screen.getByText('Analysis changed.').closest('section')?.className).toContain('bg-red-50');
});

it('does not show a green result when analysis could not be checked', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'MATCH', analysis_status: 'UNAVAILABLE', needs_restore: false })));
  showStatus();
  expect(await screen.findByText('Analysis could not be checked.')).toBeTruthy();
  expect(screen.getByText('Analysis could not be checked.').closest('section')?.className).not.toContain('bg-[#F1FBF5]');
});

it('does not claim full verification when the record check is unavailable', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'UNAVAILABLE', needs_restore: false })));
  showStatus();
  expect(await screen.findByText('Document details could not be checked.')).toBeTruthy();
  expect(screen.queryByText('PDF and document details unchanged')).toBeNull();
});

it('does not show a green result for conflicting fingerprints', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, metadata_status: 'MATCH', needs_restore: false, onchain_hash: 'abc', current_hash: 'def' })));
  showStatus();
  expect(await screen.findByText('Unable to check integrity')).toBeTruthy();
  expect(screen.queryByText('PDF and document details unchanged')).toBeNull();
});

it('does not treat conflicting results as verified and labels demo results', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'AUTHENTIC', is_authentic: false })));
  showStatus(true);
  expect(await screen.findByText('Unable to check integrity')).toBeTruthy();
  expect(screen.getByText(/Demo result only/)).toBeTruthy();
  expect(screen.queryByText('PDF and document details unchanged')).toBeNull();
});

it('warns about a mismatch without calling it a verified file', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'TAMPERED', is_authentic: false })));
  showStatus();
  expect(await screen.findByText('Document integrity warning')).toBeTruthy();
  expect(screen.queryByText('PDF and document details unchanged')).toBeNull();
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
