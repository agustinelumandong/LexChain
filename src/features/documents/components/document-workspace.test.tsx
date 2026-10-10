// @vitest-environment jsdom
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentWorkspace } from '@/features/documents/components/document-workspace';
import type { ApiSchema } from '@/shared/types';

const { attachSignedCopyMock, finalizeDocumentMock, listDocumentPartiesMock, listSignedCopiesMock, listDraftCommentsMock, replaceSignedCopyMock, syncDraftCommentsMock } = vi.hoisted(() => ({
  attachSignedCopyMock: vi.fn(),
  finalizeDocumentMock: vi.fn(),
  listDocumentPartiesMock: vi.fn(),
  listSignedCopiesMock: vi.fn(),
  listDraftCommentsMock: vi.fn(),
  replaceSignedCopyMock: vi.fn(),
  syncDraftCommentsMock: vi.fn(),
}));

vi.mock('@/features/access', () => ({
  listDocumentParties: listDocumentPartiesMock,
}));

vi.mock('@/features/documents/document-lifecycle-api', () => ({
  attachSignedCopy: attachSignedCopyMock,
  finalizeDocument: finalizeDocumentMock,
  listSignedCopies: listSignedCopiesMock,
  listDraftComments: listDraftCommentsMock,
  replaceSignedCopy: replaceSignedCopyMock,
  syncDraftComments: syncDraftCommentsMock,
}));

const document: ApiSchema<'DocumentResponse'> = {
  document_id: 'doc-101',
  file_name: 'service-agreement.pdf',
  status: null,
  lifecycle: 'PREPARING',
  on_chain: false,
  book_id: 'book-101',
  doc_no: 12,
  page_no: 7,
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
  const initialDocument = props.document ?? document;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  function WorkspaceFromQuery({ document: initialData, ...workspaceProps }: Partial<React.ComponentProps<typeof DocumentWorkspace>>) {
    const { data = initialDocument } = useQuery({
      queryKey: ['portal-doc', initialDocument.document_id],
      queryFn: async () => initialData ?? initialDocument,
      initialData: initialData ?? initialDocument,
      staleTime: Infinity,
    });
    return <DocumentWorkspace document={data} {...workspaceProps} />;
  }
  const result = render(
    <QueryClientProvider client={queryClient}>
      <WorkspaceFromQuery {...props} />
    </QueryClientProvider>,
  );
  return { ...result, invalidateQueries, queryClient };
}

describe('DocumentWorkspace', () => {
  beforeEach(() => {
    attachSignedCopyMock.mockResolvedValue(document);
    listDocumentAuditLogsMock.mockResolvedValue([]);
    listDocumentPartiesMock.mockResolvedValue({ document_id: 'doc-101', parties: [] });
    listSignedCopiesMock.mockResolvedValue({ document_id: 'doc-101', copies: [] });
    listDraftCommentsMock.mockResolvedValue({ document_id: 'doc-101', unresolved: 0, comments: [] });
    replaceSignedCopyMock.mockResolvedValue(document);
    syncDraftCommentsMock.mockResolvedValue({ document_id: 'doc-101', unresolved: 0, comments: [] });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('searches the current document through the scoped API and renders matching passages', async () => {
    const fetchMock = vi.fn(async () => Response.json({
      query: 'lease',
      document_id: 'doc-101',
      results: [{ chunk_id: 'chunk-1', chunk_index: 0, score: 0.95, text: 'The lease term is twelve months.' }],
    }));
    vi.stubGlobal('fetch', fetchMock);
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Search' }));
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search this document' }), { target: { value: ' lease ' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Search document' }).closest('form')!);

    expect(await screen.findByText('The lease term is twelve months.')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-101%2Fsearch',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ query: 'lease' }), credentials: 'same-origin' }),
    );
  });

  it('shows loading and an empty state when document search returns no matches', async () => {
    let finishSearch: ((response: Response) => void) | undefined;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { finishSearch = resolve; })));
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Search' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search this document' }), { target: { value: 'missing clause' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Search document' }).closest('form')!);
    expect(await screen.findByRole('status')).toBeTruthy();
    finishSearch?.(Response.json({ query: 'missing clause', document_id: 'doc-101', results: [] }));

    expect(await screen.findByText('No matching passages found in this document.')).toBeTruthy();
  });

  it('shows an error when document search fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'Unavailable' }, { status: 503 })));
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Search' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search this document' }), { target: { value: 'lease' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Search document' }).closest('form')!);

    expect((await screen.findByRole('alert')).textContent).toBe('Search failed. Please try again.');
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

  it('attaches a signed PDF, submits the register details, and renders the returned current copy', async () => {
    const attached = { ...document, lifecycle: 'SIGNED', signed_copy: { ...document.signed_copy!, id: 'copy-attached', storage_url: 'https://files.example/attached.pdf', original_filename: 'attached.pdf' } };
    attachSignedCopyMock.mockResolvedValue(attached);
    renderWorkspace({ document: { ...document, signed_copy: null, permissions: { ...document.permissions, can_attach_signed_copy: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    const file = new File(['signed pdf'], 'attached.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Signed PDF') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.files?.[0]).toBe(file);
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);

    await waitFor(() => expect(attachSignedCopyMock).toHaveBeenCalledWith('doc-101', file, { bookId: 'book-101', docNo: 12, pageNo: 7 }));
    expect((await screen.findByRole('status')).textContent).toContain('Signed PDF attached.');
    expect((await screen.findByRole('link', { name: 'Open current signed PDF' })).getAttribute('href')).toBe(attached.signed_copy.storage_url);
  });

  it('prevents duplicate submissions while replacement is pending', async () => {
    let finishMutation: ((value: typeof document) => void) | undefined;
    replaceSignedCopyMock.mockReturnValue(new Promise((resolve) => { finishMutation = resolve; }));
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_replace_signed_copy: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Replace signed PDF' }));
    const file = new File(['corrected pdf'], 'corrected.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Signed PDF'), { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText('Replacement reason'), { target: { value: 'Corrected scan' } });
    const submit = screen.getByRole('button', { name: 'Confirm replacement' });
    fireEvent.submit(submit.closest('form')!);
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(true));
    expect(replaceSignedCopyMock).toHaveBeenCalledTimes(1);
    finishMutation?.(document);
    await waitFor(() => expect(replaceSignedCopyMock).toHaveBeenCalledWith('doc-101', file, 'Corrected scan'));
  });

  it('retains the file and replacement reason when replacing fails', async () => {
    replaceSignedCopyMock.mockRejectedValue(new Error('Storage unavailable'));
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_replace_signed_copy: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.click(screen.getByRole('button', { name: 'Replace signed PDF' }));
    const file = new File(['corrected pdf'], 'corrected.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Signed PDF') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    const reason = screen.getByLabelText('Replacement reason') as HTMLTextAreaElement;
    fireEvent.change(reason, { target: { value: 'Corrected scan' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm replacement' }).closest('form')!);

    expect((await screen.findByRole('alert')).textContent).toMatch(/Storage unavailable.*kept/i);
    expect(input.files?.[0]).toBe(file);
    expect(reason.value).toBe('Corrected scan');
  });

  it('hides signed-copy mutations when the backend denies both permissions', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));

    expect(screen.queryByRole('button', { name: 'Attach signed PDF' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Replace signed PDF' })).toBeNull();
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

  it('does not render a backend-provided draft URL outside Google Docs', () => {
    renderWorkspace({ document: { ...document, draft_url: 'https://example.com/phishing' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.queryByRole('link', { name: 'Open Google draft' })).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('invalid Google draft link');
    expect(screen.getByRole('link', { name: 'Open current signed PDF' }).getAttribute('href')).toBe(document.signed_copy?.storage_url);
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

  it('offers account settings when the Picker token request reports a missing Google connection', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_API_KEY', 'browser-key');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_APP_ID', 'cloud-project-number');
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), window.location.origin);
      if (url.searchParams.get('path') === '/google/picker-token') return Response.json({ detail: 'GOOGLE_NOT_CONNECTED' }, { status: 409 });
      throw new Error(`Unexpected request: ${url}`);
    }));
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Draft source' }), { target: { value: 'template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose Google Doc' }));

    expect(await screen.findByRole('link', { name: 'Connect Google in account settings' })).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Draft source' }) as HTMLSelectElement).value).toBe('template');
    fireEvent.change(screen.getByRole('combobox', { name: 'Draft source' }), { target: { value: 'blank' } });
    expect(screen.queryByRole('link', { name: 'Connect Google in account settings' })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
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

  it('shows the complete returned record and keeps processing separate from finalization', () => {
    renderWorkspace({
      document: { ...document, lifecycle: 'FINALIZED', status: 'QUEUED' },
      finalizationResult: finalizationRecord,
      success: 'Document finalized and anchored on-chain.',
    });

    expect(screen.getByText('Document finalized and anchored on-chain.')).toBeTruthy();
    expect(screen.getByText('Document ID').nextElementSibling?.textContent).toBe('doc-101');
    expect(screen.getByText('onchain-doc-101')).toBeTruthy();
    expect(screen.getByText('datahash101')).toBeTruthy();
    expect(screen.getByText('0xtxhash101')).toBeTruthy();
    expect(screen.getByText('Document lifecycle').nextElementSibling?.textContent).toBe('Finalized');
    expect(screen.getByText('Processing status').nextElementSibling?.textContent).toBe('Queued');
  });

  it('keeps failed finalization retryable and never claims success', () => {
    renderWorkspace({ confirmingFinalize: true, finalizeError: 'Document cannot be finalized', onCancelFinalize: vi.fn(), onConfirmFinalize: vi.fn() });

    expect(screen.getByRole('alert').textContent).toContain('Document cannot be finalized');
    expect(screen.getByRole('button', { name: 'Confirm finalization' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('datahash101')).toBeNull();
  });

  it('links to participant management only when the backend grants share or revoke permission', () => {
    renderWorkspace({ role: 'lawyer', document: { ...document, permissions: { ...document.permissions, can_share: true } } });

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }));
    expect(screen.getByRole('link', { name: 'Manage document participants' }).getAttribute('href'))
      .toBe('/portal/documents/doc-101/participants');
    expect(screen.queryByRole('tab', { name: 'Activity' })).toBeNull();
  });

  it('shows participant details for lawyers', async () => {
    listDocumentPartiesMock.mockResolvedValue({
      document_id: 'doc-101',
      parties: [{ id: 'party-1', user_id: 'user-1', document_id: 'doc-101', email: 'reviewer@example.com', f_name: 'Avery', l_name: 'Reviewer', role: 'viewer', status: 'accepted' }],
    });
    renderWorkspace({ role: 'lawyer' });

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }));
    expect(await screen.findByText('Avery Reviewer')).toBeTruthy();
    expect(screen.getByText('reviewer@example.com')).toBeTruthy();

  });

  it('does not show participant management when the backend denies share and revoke', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: 'Access' }));
    expect(screen.queryByRole('link', { name: 'Manage document participants' })).toBeNull();
  });

  it('shows synced draft comments and permission-gated readiness controls', async () => {
    listDraftCommentsMock.mockResolvedValue({
      document_id: 'doc-101', unresolved: 1, synced_at: '2026-07-28T00:00:00Z',
      comments: [{ id: 'comment-1', author_name: 'Reviewer', is_lawyer: true, content: 'Please correct this clause.', quoted_text: 'Payment is due.', resolved: false, created_at: '2026-07-28T00:00:00Z', replies: [{ author_name: 'Issuer', is_lawyer: false, content: 'I will update it.', created_at: '2026-07-28T00:01:00Z' }] }],
    });
    syncDraftCommentsMock.mockRejectedValue(new Error('Google Docs is unavailable'));
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_mark_ready: true } }, readinessError: 'UNRESOLVED_COMMENTS: resolve all threads' });

    fireEvent.click(screen.getByRole('tab', { name: 'Comments' }));
    expect(await screen.findByText('Please correct this clause.')).toBeTruthy();
    expect(screen.getByText('Payment is due.')).toBeTruthy();
    expect(screen.getByText('I will update it.')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('UNRESOLVED_COMMENTS');
    expect(screen.getByRole('button', { name: 'Mark ready for signature' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sync comments' }));
    expect(await screen.findByText('Google Docs is unavailable')).toBeTruthy();
    expect(screen.getByText('Please correct this clause.')).toBeTruthy();
  });

  it('hides readiness controls when the backend denies the permissions', () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole('tab', { name: 'Comments' }));
    expect(screen.queryByRole('button', { name: 'Mark ready for signature' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reopen draft' })).toBeNull();
  });
});
