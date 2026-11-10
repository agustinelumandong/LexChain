// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortalRoleProvider } from '@/features/access/components/portal-role-provider';
import DocumentVerifyPage from '@/features/documents/pages/documents-id-verify-page';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'doc-1' }) }));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
  vi.stubEnv('USE_MOCK_API', 'false');
});

function renderPage(roleHint = 'lawyer', cachedDocument?: Record<string, unknown>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (cachedDocument) queryClient.setQueryData(['portal-doc', 'doc-1'], cachedDocument);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <PortalRoleProvider roleHint={roleHint}>
        <DocumentVerifyPage />
        <Toaster />
      </PortalRoleProvider>
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

afterEach(() => {
  cleanup();
  focusManager.setFocused(undefined);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('DocumentVerifyPage', () => {
  it('offers restore for an altered record even when the PDF matches', async () => {
    stubPageApi([{ ...verification('AUTHENTIC', true, true), needs_restore: true, metadata_status: 'ALTERED' }], { permissions: { can_restore: true, can_share: false }, lifecycle: 'SIGNED', on_chain: false });
    renderPage();
    expect(await screen.findByRole('button', { name: 'Restore from backup' })).toBeTruthy();
  });

  const verification = (status: string, isAuthentic: boolean, baselineTrusted: boolean, txHash: string | null = '0x' + 'a'.repeat(64)) => ({
    document_id: 'doc-1',
    status,
    is_authentic: isAuthentic,
    baseline_trusted: baselineTrusted,
    needs_restore: (status === 'TAMPERED' && baselineTrusted && !isAuthentic) || status === 'FILE_MISSING' || status === 'SNAPSHOT_COMPROMISED',
    onchain_hash: 'on-chain-hash',
    snapshot_hash: baselineTrusted ? 'on-chain-hash' : 'snapshot-hash',
    current_hash: isAuthentic ? 'on-chain-hash' : 'current-hash',
    tx_hash: txHash,
    onchain_timestamp: 1_760_000_000,
    issued_by: null,
    finalized_at: '2026-10-07T10:00:00Z',
    verified_at: '2026-10-08T10:00:00Z',
    message: `${status} verification message.`,
  });

  function stubPageApi(verificationResults: unknown[], documentOverrides: Record<string, unknown> = {}, restoreResponse?: () => Promise<Response>) {
    let verificationIndex = 0;
    const document = {
      document_id: 'doc-1',
      lifecycle: 'FINALIZED',
      on_chain: true,
      permissions: { can_restore: true },
      ...documentOverrides,
    };
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input), 'http://localhost').searchParams.get('path');
      if (init?.method === 'POST' && path === '/documents/doc-1/restore') {
        return restoreResponse?.() ?? Promise.resolve(Response.json({ detail: 'Unexpected restore request' }, { status: 500 }));
      }
      if (path === '/documents/doc-1/verify') {
        const index = Math.min(verificationIndex++, verificationResults.length - 1);
        return Promise.resolve(Response.json(verificationResults[index]));
      }
      if (path === '/documents/doc-1') return Promise.resolve(Response.json(document));
      return Promise.resolve(Response.json({ detail: 'Unexpected request' }, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('auto-starts verification on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true)));
    vi.stubGlobal('fetch', fetchMock);

    renderPage();
    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes(encodeURIComponent('/documents/doc-1/verify')))).toBe(true);
  });

  it('shows a skeleton while verification is pending', () => {
    vi.stubGlobal('fetch', () => new Promise(() => undefined));
    renderPage();
    expect(screen.getByRole('status', { name: 'Checking the document' })).toBeTruthy();
  });

  it('keeps the result on screen without re-checking when the tab regains focus', async () => {
    const fetchMock = stubPageApi([verification('AUTHENTIC', true, true)]);
    const verifyRequests = () => fetchMock.mock.calls.filter(([url]) => String(url).includes(encodeURIComponent('/documents/doc-1/verify'))).length;
    renderPage();
    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
    expect(verifyRequests()).toBe(1);

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(verifyRequests()).toBe(1);
    expect(screen.queryByRole('status', { name: 'Checking the document' })).toBeNull();
    expect(screen.getByText('PDF unchanged')).toBeTruthy();
  });

  it('shows restore for a trusted tampered document when a lawyer owns a finalized anchored record', async () => {
    stubPageApi([verification('TAMPERED', false, true)]);
    renderPage();
    expect(await screen.findByText('This PDF differs from the saved version')).toBeTruthy();
    expect(screen.getAllByText('on-chain-hash').length).toBeGreaterThan(0);
    expect(screen.getAllByText('current-hash').length).toBeGreaterThan(0);
    expect(screen.getByText('Detailed comparison unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restore from backup' })).toBeTruthy();
  });

  it('does not offer restore when the backend says no repair is needed', async () => {
    const tamperedNoBackup = {
      ...verification('TAMPERED', false, true),
      needs_restore: false,
      tamper_report_status: 'UNAVAILABLE',
      tamper_report_unavailable_reason: 'No archived original to compare against.',
    };
    stubPageApi([tamperedNoBackup]);
    renderPage();

    expect(await screen.findByText('This PDF differs from the saved version')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restore from backup' })).toBeNull();
  });

  it.each([
    ['user', {}],
    ['lawyer', { permissions: { can_restore: false } }],
    ['lawyer', { permissions: {} }],
  ])('hides restore for role or document state without restore permission', async (role, documentOverrides) => {
    stubPageApi([verification('TAMPERED', false, true)], documentOverrides);
    renderPage(role);

    expect(await screen.findByText('This PDF differs from the saved version')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restore from backup' })).toBeNull();
  });

  it.each([
    ['AUTHENTIC', true, true, 'PDF unchanged'],
    ['TAMPERED', false, false, 'This PDF differs from the saved version'],
    ['VERIFICATION_UNAVAILABLE', false, true, 'We could not check this document'],
    ['NOT_ANCHORED', false, false, 'No blockchain record is saved'],
  ])('does not offer restore for %s verification', async (status, authentic, trusted, heading) => {
    stubPageApi([verification(status, authentic, trusted)]);
    renderPage();

    expect(await screen.findByText(heading)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restore from backup' })).toBeNull();
  });

  it.each(['FILE_MISSING', 'SNAPSHOT_COMPROMISED'])('offers a lawyer restore for %s', async (status) => {
    stubPageApi([verification(status, false, status === 'FILE_MISSING')]);
    renderPage();
    expect(await screen.findByRole('button', { name: 'Restore from backup' })).toBeTruthy();
  });

  it('explains when restore permission cannot be checked and retries the document request', async () => {
    let documentRequests = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = new URL(String(input), 'http://localhost').searchParams.get('path');
      if (path === '/documents/doc-1/verify') return Promise.resolve(Response.json(verification('TAMPERED', false, true)));
      if (path === '/documents/doc-1') {
        documentRequests += 1;
        return documentRequests === 1
          ? Promise.resolve(Response.json({ message: 'Temporary failure' }, { status: 503 }))
          : Promise.resolve(Response.json({
              document_id: 'doc-1', lifecycle: 'FINALIZED', on_chain: true, permissions: { can_restore: true },
            }));
      }
      return Promise.resolve(Response.json({ detail: 'Unexpected request' }, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    expect(await screen.findByText('We could not confirm your permission to restore this document, so restore is unavailable.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restore from backup' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('button', { name: 'Restore from backup' })).toBeTruthy();
    expect(documentRequests).toBe(2);
  });

  it('hides restore when a cached owner permission fails to refresh', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const path = new URL(String(input), 'http://localhost').searchParams.get('path');
      if (path === '/documents/doc-1/verify') return Promise.resolve(Response.json(verification('TAMPERED', false, true)));
      if (path === '/documents/doc-1') return Promise.resolve(Response.json({ message: 'Permission could not be refreshed' }, { status: 403 }));
      return Promise.resolve(Response.json({ detail: 'Unexpected request' }, { status: 404 }));
    }));
    renderPage('lawyer', {
      document_id: 'doc-1', lifecycle: 'FINALIZED', on_chain: true, permissions: { can_restore: true },
    });

    expect(await screen.findByText('We could not confirm your permission to restore this document, so restore is unavailable.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Restore from backup' })).toBeNull();
  });

  it('requires confirmation and lets the lawyer cancel without sending a restore request', async () => {
    const fetchMock = stubPageApi([verification('TAMPERED', false, true)]);
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));

    expect(screen.getByRole('dialog', { name: 'Restore archived original' })).toBeTruthy();
    expect(screen.getByText(/Restore this document from its original copy/i)).toBeTruthy();
    expect(screen.getByText(/stays in signed-copy history if it can still be read/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Restore archived original' })).toBeNull();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes(encodeURIComponent('/documents/doc-1/restore')))).toHaveLength(0);
  });

  it('shows the fresh verification after restoring and refreshes related document queries', async () => {
    const tampered = verification('TAMPERED', false, true);
    const authentic = verification('AUTHENTIC', true, true);
    const result = {
      document_id: 'doc-1',
      restored: true,
      restored_hash: 'on-chain-hash',
      restored_copy_id: 'restored-copy-1',
      preserved_copy_id: null,
      verification: authentic,
    };
    const fetchMock = stubPageApi([tampered, authentic], {}, () => Promise.resolve(Response.json(result)));
    const { queryClient } = renderPage();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore archived original' }));

    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
    expect(await screen.findByText('Document repair completed.')).toBeTruthy();
    expect(queryClient.getQueryData(['portal-doc-chain', 'doc-1'])).toEqual(authentic);
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).includes(encodeURIComponent('/documents/doc-1/restore')) && init?.method === 'POST')).toBe(true);
    for (const queryKey of [
      ['portal-doc', 'doc-1'],
      ['portal-documents'],
      ['portal-doc-signed-copies', 'doc-1'],
      ['portal-document-history', 'doc-1'],
      ['portal-doc-chain', 'doc-1'],
    ]) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey });
    }
  });

  it('handles a safe no-op when the backend finds the document already authentic', async () => {
    const authentic = verification('AUTHENTIC', true, true);
    const result = { document_id: 'doc-1', restored: false, restored_hash: 'on-chain-hash', restored_copy_id: 'copy-1', verification: authentic };
    stubPageApi([verification('TAMPERED', false, true), authentic], {}, () => Promise.resolve(Response.json(result)));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore archived original' }));

    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
    expect(await screen.findByText('Nothing needed repair. Verification has been refreshed.')).toBeTruthy();
  });

  it('shows repaired and unrepaired values after a partial repair', async () => {
    const authentic = verification('AUTHENTIC', true, true);
    stubPageApi([verification('TAMPERED', false, true), authentic], {}, () => Promise.resolve(Response.json({
      document_id: 'doc-1', restored: true, verification: authentic,
      repaired: [{ record: 'metadata', field: 'document_number', old: 15, new: 12 }],
      unrepaired: ['snapshot.signed_copy_id'],
    })));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore archived original' }));

    const result = await screen.findByRole('region', { name: 'Restore result' });
    expect(within(result).getByText('Repaired: Document number')).toBeTruthy();
    expect(within(result).getByRole('heading', { name: 'Repair needs attention' })).toBeTruthy();
    expect(within(result).getByRole('alert').textContent).toBe('Needs manual recovery: Signed copy ID');
  });

  it('prevents duplicate restore requests while the backend request is pending', async () => {
    const authentic = verification('AUTHENTIC', true, true);
    let resolveRestore: ((response: Response) => void) | undefined;
    const restoreResponse = new Promise<Response>((resolve) => { resolveRestore = resolve; });
    const fetchMock = stubPageApi([verification('TAMPERED', false, true), authentic], {}, () => restoreResponse);
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));
    const confirm = screen.getByRole('button', { name: 'Restore archived original' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    const restoreCalls = () => fetchMock.mock.calls.filter(([url, init]) => new URL(String(url), 'http://localhost').searchParams.get('path') === '/documents/doc-1/restore' && init?.method === 'POST');
    await waitFor(() => expect(restoreCalls()).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Restoring…' }).hasAttribute('disabled')).toBe(true);
    resolveRestore?.(Response.json({
      document_id: 'doc-1',
      restored: true,
      restored_hash: 'on-chain-hash',
      restored_copy_id: 'restored-copy-1',
      preserved_copy_id: 'copy-preserved',
      verification: authentic,
    }));
    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
  });

  it('keeps the confirmation open and shows the backend error when restore fails', async () => {
    const message = 'Restore is restricted to the document owner.';
    stubPageApi([verification('TAMPERED', false, true)], {}, () => Promise.resolve(Response.json({ message, details: { reason: 'FORBIDDEN' } }, { status: 403 })));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore from backup' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore archived original' }));

    const dialog = screen.getByRole('dialog', { name: 'Restore archived original' });
    expect((await within(dialog).findByRole('alert')).textContent).toContain(message);
    expect(screen.getByRole('button', { name: 'Restore archived original' }).hasAttribute('disabled')).toBe(false);
  });

  it('fails closed when AUTHENTIC conflicts with is_authentic=false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', false, true))));
    renderPage();

    expect(await screen.findByText('We could not check this document')).toBeTruthy();
    expect(screen.queryByText('PDF unchanged')).toBeNull();
  });

  it.each([
    ['AUTHENTIC', true, true, 'PDF unchanged'],
    ['TAMPERED', false, true, 'This PDF differs from the saved version'],
    ['NOT_ANCHORED', false, false, 'No blockchain record is saved'],
    ['VERIFICATION_UNAVAILABLE', false, true, 'We could not check this document'],
    ['SNAPSHOT_COMPROMISED', false, false, 'The saved reference needs attention'],
  ])('preserves the %s verification verdict', async (status, authentic, baseline, heading) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification(status, authentic, baseline))));
    renderPage();
    expect(await screen.findByText(heading)).toBeTruthy();
  });

  it.each(['VERIFICATION_UNAVAILABLE', 'NOT_ANCHORED'])(
    'allows retry for %s',
    async (status) => {
      const fetchMock = stubPageApi([verification(status, false, false), verification('AUTHENTIC', true, true)]);
      renderPage();

      await screen.findByRole('button', { name: 'Try again' });
      screen.getByRole('button', { name: 'Try again' }).click();

      expect(await screen.findByText('PDF unchanged')).toBeTruthy();
      expect(fetchMock.mock.calls.filter(([url]) => String(url).includes(encodeURIComponent('/documents/doc-1/verify')))).toHaveLength(2);
    },
  );

  it('links a valid transaction hash to Base Sepolia beside the existing Copy control', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true))));
    renderPage();

    const transactionLink = await screen.findByRole('link', { name: 'View transaction on Base Sepolia' });
    expect(transactionLink.getAttribute('href')).toBe(`https://sepolia.basescan.org/tx/0x${'a'.repeat(64)}`);
    expect(within(screen.getByRole('region', { name: 'Verification result' })).getByRole('button', { name: 'Copy Transaction hash' })).toBeTruthy();
  });

  it.each([null, 'not-a-transaction-hash'])(
    'omits the transaction link for missing or malformed hash %s',
    async (txHash) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true, txHash))));
      renderPage();

      expect(await screen.findByText('PDF unchanged')).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'View transaction on Base Sepolia' })).toBeNull();
    },
  );

  it('labels mock verification as simulated but not live verification', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true))));
    const { unmount } = renderPage();

    expect(await screen.findByText(/simulated and does not represent a real backend or blockchain verification/i)).toBeTruthy();

    unmount();
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true))));
    renderPage();

    expect(await screen.findByText('PDF unchanged')).toBeTruthy();
    expect(screen.queryByText(/simulated and does not represent a real backend or blockchain verification/i)).toBeNull();
  });

  it('labels a failed verification request separately from a backend tamper verdict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ detail: 'Gateway unavailable' }, { status: 503 })));
    renderPage();

    expect(await screen.findByText('We could not check this document')).toBeTruthy();
    expect(screen.getByText('API error: 503')).toBeTruthy();
    expect(screen.queryByText('This PDF differs from the saved version')).toBeNull();
    expect(screen.queryByText('PDF unchanged')).toBeNull();
  });

  it('explains a 404 as a missing or unanchored document without offering a retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ detail: 'Document not found' }, { status: 404 })));
    renderPage();

    expect(await screen.findByText('No saved blockchain record found')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
