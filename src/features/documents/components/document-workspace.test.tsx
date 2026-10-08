// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentWorkspace } from '@/features/documents/components/document-workspace';
import type { ApiSchema } from '@/shared/types';

const { finalizeDocumentMock, listSignedCopiesMock } = vi.hoisted(() => ({
  finalizeDocumentMock: vi.fn(),
  listSignedCopiesMock: vi.fn(),
}));

vi.mock('@/features/documents/document-lifecycle-api', () => ({
  finalizeDocument: finalizeDocumentMock,
  listSignedCopies: listSignedCopiesMock,
}));

const document: ApiSchema<'DocumentResponse'> = {
  document_id: 'doc-101',
  file_name: 'service-agreement.pdf',
  status: null,
  lifecycle: 'PREPARING',
  on_chain: false,
  draft_url: 'https://docs.google.com/document/d/draft-101',
  signed_copy: {
    id: 'copy-101',
    storage_url: 'https://files.example/service-agreement.pdf',
    sha256: 'signed-hash',
    content_type: 'application/pdf',
    size_bytes: 1024,
    original_filename: 'service-agreement-signed.pdf',
    is_current: true,
    created_at: '2026-07-28T00:00:00Z',
  },
  permissions: {
    can_view: true,
    can_rename: false,
    can_create_draft: false,
    can_mark_ready: false,
    can_reopen: false,
    can_attach_signed_copy: false,
    can_replace_signed_copy: false,
    can_correct_entry: false,
    can_cancel: false,
    can_finalize: false,
    can_share: false,
    can_revoke: false,
  },
  summary: 'A summary generated from the document.',
  labels: ['Service agreement'],
  entities: [{ name: 'Acme Legal' }],
  risk_flags: [{ severity: 'review', detail: 'Payment term' }],
  created_at: '2026-07-28T00:00:00Z',
};

const finalizationRecord: ApiSchema<'RecordResponse'> = {
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
        {...props}
      />
    </QueryClientProvider>,
  );
  return { ...result, invalidateQueries };
}

describe('DocumentWorkspace', () => {
  beforeEach(() => {
    listSignedCopiesMock.mockResolvedValue({ document_id: 'doc-101', copies: [] });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('shows supported signed-copy history separately from document versions', async () => {
    listSignedCopiesMock.mockResolvedValue({ document_id: 'doc-101', copies: [
      { id: 'copy-current', storage_url: 'https://files.example/current.pdf', sha256: 'current-hash', content_type: 'application/pdf', size_bytes: 100, original_filename: 'current.pdf', uploaded_by: null, replaced_reason: null, is_current: true, created_at: '2026-07-28T00:00:00Z' },
      { id: 'copy-old', storage_url: 'https://files.example/old.pdf', sha256: 'old-hash', content_type: 'application/pdf', size_bytes: 90, original_filename: 'old.pdf', uploaded_by: null, replaced_reason: 'Corrected scan', is_current: false, created_at: '2026-07-27T00:00:00Z' },
    ] });
    renderWorkspace();
    expect(listSignedCopiesMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: 'Signed copies' }));
    expect(await screen.findByText('current.pdf')).toBeTruthy();
    expect(listSignedCopiesMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Current copy')).toBeTruthy();
    expect(screen.getByText('old.pdf')).toBeTruthy();
    expect(screen.getByText('Replaced: Corrected scan')).toBeTruthy();
    expect(screen.getByText('old-hash')).toBeTruthy();
  });

  it('shows populated document metadata in the Overview tab', () => {
    renderWorkspace();

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByRole('heading', { name: 'Overview' })).toBeTruthy();
    expect(within(overview).getByText('Filename').nextElementSibling?.textContent).toBe('service-agreement.pdf');
    expect(within(overview).getByText('Signed copy content type').nextElementSibling?.textContent).toBe('application/pdf');
    expect(within(overview).getByText('Processing status').nextElementSibling?.textContent).toBe('No processing status yet');
    expect(within(overview).getByText('Document lifecycle').nextElementSibling?.textContent).toBe('Preparing');
  });

  it('marks missing Overview metadata as not supplied', () => {
    renderWorkspace({ document: { ...document, signed_copy: null } });

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByText('Signed copy content type').nextElementSibling?.textContent).toBe('Not supplied');
  });

  it('keeps original files and derived insights in separate tabs', () => {
    renderWorkspace();

    expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
    expect(screen.getByText(/AI-generated assistance/i)).toBeTruthy();
    expect(screen.getByText(/original document remains authoritative/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByRole('link', { name: 'Open current signed PDF' }).getAttribute('href')).toBe(document.signed_copy?.storage_url);
    expect(screen.getByRole('link', { name: 'Download current signed PDF' }).hasAttribute('download')).toBe(true);
    expect(screen.getByRole('link', { name: 'Open Google draft' }).getAttribute('href')).toBe(document.draft_url);

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/not been finalized or recorded on-chain/i)).toBeTruthy();
  });

  it('creates a blank Google draft and keeps its link separate from the signed PDF', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      if (url.searchParams.get('path') === '/documents/doc-101/draft' && init?.method === 'POST') {
        return Response.json({ ...document, draft_url: 'https://docs.google.com/document/d/blank-draft' }, { status: 201 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Create blank Google draft' }));

    const draftLink = await screen.findByRole('link', { name: 'Open Google draft' });
    expect(draftLink.getAttribute('href')).toBe('https://docs.google.com/document/d/blank-draft');
    expect(draftLink.getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('link', { name: 'Open current signed PDF' }).getAttribute('href')).toBe(document.signed_copy?.storage_url);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-101%2Fdraft',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ source: 'blank' }) }),
    );
  });

  it('keeps a picked template after a missing-Google-connection error and allows retry', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_API_KEY', 'browser-key');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_APP_ID', 'cloud-project-number');
    let pickerCallback: (data: unknown) => void = () => undefined;
    class PickerBuilder {
      addView() { return this; }
      setOAuthToken() { return this; }
      setDeveloperKey() { return this; }
      setAppId() { return this; }
      setTitle() { return this; }
      setCallback(callback: (data: unknown) => void) { pickerCallback = callback; return this; }
      build() {
        return { setVisible: (visible: boolean) => {
          if (visible) pickerCallback({ action: 'picked', docs: [{ id: 'template-77', name: 'Client template', mimeType: 'application/vnd.google-apps.document' }] });
        } };
      }
    }
    class DocsView {
      setMimeTypes() { return this; }
    }
    Object.assign(window, {
      gapi: { load: (_library: string, callback: () => void) => callback() },
      google: { picker: { Action: { PICKED: 'picked', CANCEL: 'cancel' }, ViewId: { DOCS: 'docs' }, DocsView, PickerBuilder } },
    });
    let createCount = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      const path = url.searchParams.get('path');
      if (path === '/google/picker-token') return Response.json({ access_token: 'short-lived-picker-token', expires_at: '2099-01-01T00:00:00Z' });
      if (path === '/documents/doc-101/draft' && init?.method === 'POST') {
        createCount += 1;
        if (createCount === 1) return Response.json({ detail: 'GOOGLE_NOT_CONNECTED' }, { status: 409 });
        return Response.json({ ...document, draft_url: 'https://docs.google.com/document/d/template-draft' }, { status: 201 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.change(await screen.findByRole('combobox', { name: 'Draft source' }), { target: { value: 'template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose Google Doc' }));
    expect(await screen.findByText(/Client template/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Create draft from template' }));

    expect(await screen.findByRole('link', { name: 'Connect Google in account settings' })).toBeTruthy();
    expect(screen.getByText(/Client template/)).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Draft source' }) as HTMLSelectElement).value).toBe('template');
    fireEvent.click(screen.getByRole('button', { name: 'Create draft from template' }));
    expect(await screen.findByRole('link', { name: 'Open Google draft' })).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fgoogle%2Fpicker-token', expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-101%2Fdraft',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ source: 'template', file_id: 'template-77' }) }),
    );
    await waitFor(() => expect(createCount).toBe(2));
  });

  it('explains unavailable data without inventing controls or restricted workflow actions', () => {
    renderWorkspace({ document: { ...document, status: 'PROCESSING', signed_copy: null, draft_url: null, summary: null, labels: [], entities: [], risk_flags: [] } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByText('No signed PDF is attached to this document yet.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /signed PDF/i })).toBeNull();
    expect(screen.queryByText(/AI-generated assistance/i)).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/not been finalized or recorded on-chain/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Anchor|Finalize|Confirm record/i })).toBeNull();
  });

  it('shows the document hash from the document record in Overview', () => {
    renderWorkspace({ document: { ...document, document_hash: 'a'.repeat(64) } });

    const hashRow = screen.getByText('Document hash');
    expect(hashRow.nextElementSibling?.textContent).toContain('…');
    expect(hashRow.nextElementSibling?.getAttribute('title')).toBe('a'.repeat(64));
  });

  it('renders a mismatched integrity record with the warning treatment', () => {
    renderWorkspace({ document: { ...document, document_hash: 'a'.repeat(64) } });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('This document has not been finalized or recorded on-chain.')).toBeTruthy();
  });

  it('shows an on-chain anchor only when the backend reports one', () => {
    renderWorkspace({ document: { ...document, on_chain: true, lifecycle: 'FINALIZED', document_hash: 'chain-hash' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('Recorded on-chain')).toBeTruthy();
    expect(screen.getByText('chain-hash')).toBeTruthy();
  });

  it('renders one-key insight objects as readable key-value details', () => {
    renderWorkspace();

    expect(screen.getByText('name — Acme Legal')).toBeTruthy();
  });

  it('keeps a document read-only when its backend permissions deny actions', () => {
    renderWorkspace();

    expect(screen.getByText('Document lifecycle').nextElementSibling?.textContent).toBe('Preparing');
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it('renders the confirmation dialog when the parent opens it', () => {
    const onCancelFinalize = vi.fn();
    const onConfirmFinalize = vi.fn();
    renderWorkspace({ confirmingFinalize: true, onCancelFinalize, onConfirmFinalize });

    const dialog = screen.getByRole('dialog', { name: 'Confirm finalization' });
    expect(within(dialog).getByText(/This will anchor the approved document hash on-chain/)).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onCancelFinalize).toHaveBeenCalledOnce();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm finalization' }));
    expect(onConfirmFinalize).toHaveBeenCalledOnce();
    expect(finalizeDocumentMock).not.toHaveBeenCalled();
  });

  it('disables the finalization mutation button while the parent reports it pending', () => {
    renderWorkspace({ confirmingFinalize: true, isFinalizing: true, onCancelFinalize: vi.fn(), onConfirmFinalize: vi.fn() });

    const confirm = screen.getByRole('button', { name: 'Finalizing…' });
    expect(confirm.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true);
  });

  it('shows returned record hashes and success copy from the parent', () => {
    renderWorkspace({ finalizationResult: finalizationRecord, success: 'Document finalized and anchored on-chain.' });

    expect(screen.getByText('Document finalized and anchored on-chain.')).toBeTruthy();
    expect(screen.getByText('datahash101')).toBeTruthy();
    expect(screen.getByText('0xtxhash101')).toBeTruthy();
  });

  it('keeps failed finalization retryable and never claims success', () => {
    renderWorkspace({ confirmingFinalize: true, finalizeError: 'Document cannot be finalized', onCancelFinalize: vi.fn(), onConfirmFinalize: vi.fn() });

    expect(screen.getByRole('alert').textContent).toContain('Document cannot be finalized');
    expect(screen.getByRole('button', { name: 'Confirm finalization' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('datahash101')).toBeNull();
  });

  it('links to participant management only when the backend grants share or revoke permission', () => {
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_share: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }));
    expect(screen.getByRole('link', { name: 'Manage document participants' }).getAttribute('href'))
      .toBe('/portal/documents/doc-101/participants');
    fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByRole('link', { name: 'View document activity' }).getAttribute('href'))
      .toBe('/portal/documents/doc-101/activity');
  });

  it('does not show participant management when the backend denies share and revoke', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }));
    expect(screen.queryByRole('link', { name: 'Manage document participants' })).toBeNull();
  });
});
