// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentWorkspace } from './document-workspace';

const { finalizeDocumentMock, restoreDemoSnapshotMock, listDocumentVersionsMock } = vi.hoisted(() => ({
  finalizeDocumentMock: vi.fn(),
  restoreDemoSnapshotMock: vi.fn(),
  listDocumentVersionsMock: vi.fn(),
}));

vi.mock('../../lib/document-lifecycle-api', () => ({
  finalizeDocument: finalizeDocumentMock,
  listDocumentVersions: listDocumentVersionsMock,
  restoreDemoSnapshot: restoreDemoSnapshotMock,
}));

const snapshot = {
  id: 'snapshot-1',
  document_id: 'doc-101',
  text_hash: 'a'.repeat(64),
  created_at: '2026-07-26T00:00:00.000Z',
};

const document = {
  document_id: 'doc-101',
  document_number: 101,
  file_name: 'service-agreement.pdf',
  status: 'COMPLETED',
  content_type: 'application/pdf',
  storage_url: 'https://files.example/service-agreement.pdf',
  summary: 'A summary generated from the document.',
  labels: ['Service agreement'],
  entities: [{ name: 'Acme Legal' }],
  risk_flags: [{ severity: 'review', detail: 'Payment term' }],
  lifecycle: 'draft' as const,
  document_hash: null,
  finalized_at: null,
  finalized_by: null,
  anchor_status: null,
  snapshots: [],
};

const finalizedLifecycle = {
  lifecycle: 'finalized' as const,
  document_hash: 'a'.repeat(64),
  finalized_at: '2026-07-26T00:00:00.000Z',
  finalized_by: 'issuer-1',
  anchor_status: 'confirmed' as const,
  snapshots: [snapshot],
};

const finalizationRecord = {
  document_id: 'doc-101',
  tx_hash: '0xtxhash101',
  onchain_document_id: 'onchain-doc-101',
  data_hash: 'datahash101',
};

function renderWorkspace(props: Partial<React.ComponentProps<typeof DocumentWorkspace>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <DocumentWorkspace
        document={document}
        role="issuer"
        integrityState="recorded"
        {...props}
      />
    </QueryClientProvider>,
  );
  return { ...result, invalidateQueries };
}

describe('DocumentWorkspace', () => {
  beforeEach(() => {
    listDocumentVersionsMock.mockResolvedValue({ total_version: 1, versions: [] });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the API version history instead of only demo snapshots', async () => {
    listDocumentVersionsMock.mockResolvedValue({ total_version: 2, versions: [{ document_id: 'doc-101', version: 2, file_name: 'updated.pdf', status: 'AWAITING_REVIEW', lifecycle: 'DRAFT', is_latest: true, created_at: '2026-07-28T00:00:00Z' }] });
    renderWorkspace();
    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));
    expect(await screen.findByText('Version 2 · Latest')).toBeTruthy();
  });

  it('shows populated document metadata in the Overview tab', () => {
    renderWorkspace();

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByRole('heading', { name: 'Overview' })).toBeTruthy();
    expect(within(overview).getByText('Filename').nextElementSibling?.textContent).toBe('service-agreement.pdf');
    expect(within(overview).getByText('Reference').nextElementSibling?.textContent).toBe('101');
    expect(within(overview).getByText('Content type').nextElementSibling?.textContent).toBe('application/pdf');
    expect(within(overview).getByText('Lifecycle status').nextElementSibling?.textContent).toBe('COMPLETED');
    expect(within(overview).getByText('Integrity status').nextElementSibling?.textContent).toBe('Integrity record available');
  });

  it('marks missing Overview metadata as not supplied', () => {
    renderWorkspace({ document: { ...document, document_number: null, content_type: null, storage_url: null } });

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByText('Reference').nextElementSibling?.textContent).toBe('Not supplied');
    expect(within(overview).getByText('Content type').nextElementSibling?.textContent).toBe('Not supplied');
  });

  it('keeps original files, derived insights, and integrity data in separate tabs', () => {
    renderWorkspace({ chain: { data_hash: '0xabc', tx_hash: '0xdef', onchain_timestamp: 1_700_000_000 } });

    expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Original PDF' }));
    expect(screen.getByRole('link', { name: 'Open original PDF' }).getAttribute('href')).toBe(document.storage_url);
    expect(screen.getByRole('link', { name: 'Download original PDF' }).hasAttribute('download')).toBe(true);

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText(/AI-generated assistance/i)).toBeTruthy();
    expect(screen.getByText(/original document remains authoritative/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/supports integrity checking, not legal validity/i)).toBeTruthy();
    expect(screen.getByText('0xabc')).toBeTruthy();
    expect(screen.getByText('Integrity record available')).toBeTruthy();
  });

  it('explains unavailable data without inventing controls or restricted workflow actions', () => {
    renderWorkspace({ document: { ...document, status: 'PROCESSING', storage_url: '', summary: null, labels: [], entities: [], risk_flags: [] }, integrityState: 'not_recorded' });

    fireEvent.click(screen.getByRole('tab', { name: 'Original PDF' }));
    expect(screen.getByText(/original PDF is not available/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /original PDF/i })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText(/no derived insights are available/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/no blockchain record is available/i)).toBeTruthy();
    expect(screen.queryByText(/Anchor to Blockchain|Finali[sz]e|Confirm record/i)).toBeNull();
  });

  it('shows an unavailable integrity state with a retry action instead of a record claim', () => {
    const onRetry = vi.fn();
    renderWorkspace({ integrityState: 'unavailable', onRetry });

    expect(screen.getByText('Integrity status unavailable')).toBeTruthy();
    expect(screen.queryByText('Blockchain record available')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry integrity lookup' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders a mismatched integrity record with the warning treatment', () => {
    renderWorkspace({ chain: { data_hash: '0xabc' }, integrityState: 'mismatch' });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    const mismatch = screen.getByText('Integrity mismatch');
    expect(mismatch.className).toContain('bg-[#FFF4DD]');
    expect(mismatch.className).toContain('text-[#B77900]');
    expect(mismatch.className).not.toContain('text-[#12A150]');
  });

  it('renders one-key insight objects as readable key-value details', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText('name — Acme Legal')).toBeTruthy();
  });

  it('offers finalization only to an issuer with a completed draft', () => {
    renderWorkspace();

    expect(screen.getByRole('button', { name: 'Finalize' })).toBeTruthy();
  });

  it('keeps a non-demo document response read-only when lifecycle fields are absent', () => {
    renderWorkspace({
      document: {
        ...document,
        lifecycle: undefined as never,
        document_hash: undefined as never,
        finalized_at: undefined as never,
        finalized_by: undefined as never,
        anchor_status: undefined as never,
        snapshots: undefined as never,
      },
    });

    expect(screen.getByText('Document lifecycle').nextElementSibling?.textContent).toBe('Not available');
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it.each([
    ['participant', { role: 'participant' as const }],
    ['processing document', { document: { ...document, status: 'PROCESSING' } }],
    ['review-ready document', { document: { ...document, status: 'READY_FOR_REVIEW' } }],
    ['already-finalized document', { document: { ...document, ...finalizedLifecycle } }],
  ])('does not offer finalization to a %s', (_label, props) => {
    renderWorkspace(props);

    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it('requires explicit confirmation of the real finalization effect', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));

    const dialog = screen.getByRole('dialog', { name: 'Confirm finalization' });
    expect(within(dialog).getByText(/This will anchor the approved document hash on-chain/)).toBeTruthy();
    expect(finalizeDocumentMock).not.toHaveBeenCalled();
  });

  it('disables the finalization mutation button while the request is pending', async () => {
    finalizeDocumentMock.mockReturnValue(new Promise(() => undefined));
    renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));

    const confirm = screen.getByRole('button', { name: 'Confirm finalization' });
    fireEvent.click(confirm);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Finalizing…' }).hasAttribute('disabled')).toBe(true));
  });

  it('shows returned record hashes and refreshes affected queries after finalization', async () => {
    finalizeDocumentMock.mockResolvedValue(finalizationRecord);
    const { invalidateQueries } = renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    expect(await screen.findByText('Document finalized and anchored on-chain.')).toBeTruthy();
    expect(screen.getByText('datahash101')).toBeTruthy();
    expect(screen.getByText('0xtxhash101')).toBeTruthy();
    expect(invalidateQueries).toHaveBeenCalledTimes(4);
    for (const queryKey of [
      ['portal-doc', 'doc-101'],
      ['portal-doc-chain', 'doc-101'],
      ['portal-doc-snapshots', 'doc-101'],
      ['portal-document-audit', 'doc-101'],
    ]) {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey });
    }
  });

  it('shows snapshot dates and shortened text hashes in Versions', () => {
    renderWorkspace({ document: { ...document, ...finalizedLifecycle }, snapshots: [snapshot] });

    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));

    expect(screen.getByText(/Jul 26, 2026/)).toBeTruthy();
    expect(screen.getByText('aaaaaaaaaa…aaaaaaaa')).toBeTruthy();
  });

  it('offers restoration only for an issuer with a mismatch and snapshot', () => {
    renderWorkspace({
      document: { ...document, ...finalizedLifecycle },
      integrityState: 'mismatch',
      snapshots: [snapshot],
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));
    expect(screen.getByRole('button', { name: 'Restore' })).toBeTruthy();
  });

  it('requires a reason and explicit confirmation before restoring', async () => {
    restoreDemoSnapshotMock.mockResolvedValue({ ...finalizedLifecycle, lifecycle: 'restored' });
    renderWorkspace({
      document: { ...document, ...finalizedLifecycle },
      integrityState: 'mismatch',
      snapshots: [snapshot],
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));

    const dialog = screen.getByRole('dialog', { name: 'Confirm text snapshot restoration' });
    const confirm = within(dialog).getByRole('button', { name: 'Confirm restoration' });
    expect(within(dialog).getByLabelText('Restoration reason').hasAttribute('required')).toBe(true);
    expect(confirm.hasAttribute('disabled')).toBe(true);
    expect(restoreDemoSnapshotMock).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('Restoration reason'), {
      target: { value: 'Restore the reviewed extracted text.' },
    });
    expect(confirm.hasAttribute('disabled')).toBe(false);
    fireEvent.click(confirm);
    await waitFor(() => expect(restoreDemoSnapshotMock).toHaveBeenCalledWith(
        'doc-101',
        'snapshot-1',
        'Restore the reviewed extracted text.',
      ));
  });

  it('states that restoration changes extracted text rather than the original PDF', async () => {
    restoreDemoSnapshotMock.mockResolvedValue({ ...finalizedLifecycle, lifecycle: 'restored' });
    renderWorkspace({
      document: { ...document, ...finalizedLifecycle },
      integrityState: 'mismatch',
      snapshots: [snapshot],
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    fireEvent.change(screen.getByLabelText('Restoration reason'), { target: { value: 'Repair mismatch.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restoration' }));

    expect(await screen.findByText('Extracted text was restored from the selected snapshot. The original PDF was not changed.')).toBeTruthy();
  });

  it('keeps failed finalization retryable and never claims success', async () => {
    finalizeDocumentMock.mockRejectedValue(new Error('Document cannot be finalized'));
    renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Document cannot be finalized');
    expect(screen.getByRole('button', { name: 'Confirm finalization' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('datahash101')).toBeNull();
  });

  it('keeps failed restoration retryable and never claims success', async () => {
    restoreDemoSnapshotMock.mockRejectedValue(new Error('Document cannot be restored'));
    renderWorkspace({
      document: { ...document, ...finalizedLifecycle },
      integrityState: 'mismatch',
      snapshots: [snapshot],
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Versions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    fireEvent.change(screen.getByLabelText('Restoration reason'), { target: { value: 'Repair mismatch.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restoration' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Document cannot be restored');
    expect(screen.getByRole('button', { name: 'Confirm restoration' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText(/Extracted text was restored/)).toBeNull();
  });

  it.each([
    ['Access', 'Manage document participants', '/portal/documents/doc-101/participants'],
    ['Activity', 'View document activity', '/portal/documents/doc-101/activity'],
  ] as const)('links %s to its existing document surface', (tab, label, href) => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: tab }));
    expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(href);
  });

  it.each([
    ['Access', 'Manage document participants'],
    ['Activity', 'View document activity'],
  ] as const)('does not show the issuer-only %s link to participants', (tab, label) => {
    renderWorkspace({ role: 'participant' });

    fireEvent.click(screen.getByRole('tab', { name: tab }));
    expect(screen.queryByRole('link', { name: label })).toBeNull();
  });
});
