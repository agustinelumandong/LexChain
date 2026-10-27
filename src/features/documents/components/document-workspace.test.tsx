// @vitest-environment jsdom
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentWorkspace } from '@/features/documents/components/document-workspace';
import { LifecycleRequestError } from '@/features/documents/document-lifecycle-api';
import type { ApiSchema } from '@/shared/types';
import { readGoogleDraftReturnContext, saveGoogleDraftReturnContext } from '@/shared/utils/google-draft-return-context';

vi.mock('@/features/documents/components/pdf-document-viewer', () => ({ default: () => null }));

const { attachSignedCopyMock, correctDocumentEntryMock, listDocumentHistoryMock, listDocumentPartiesMock, listRegisterBooksMock, listSignedCopiesMock, listDraftCommentsMock, replaceSignedCopyMock, syncDraftCommentsMock, LifecycleRequestErrorMock } = vi.hoisted(() => ({
  attachSignedCopyMock: vi.fn(),
  correctDocumentEntryMock: vi.fn(),
  listDocumentHistoryMock: vi.fn(),
  listDocumentPartiesMock: vi.fn(),
  listRegisterBooksMock: vi.fn(),
  listSignedCopiesMock: vi.fn(),
  listDraftCommentsMock: vi.fn(),
  replaceSignedCopyMock: vi.fn(),
  syncDraftCommentsMock: vi.fn(),
  LifecycleRequestErrorMock: class LifecycleRequestError extends Error {
    status: number;
    reason: string;
    unresolved?: number;
    draftUrl?: string;
    constructor(message: string, status: number, details: { reason: string; unresolved?: number; draft_url?: string }) {
      super(message);
      this.status = status;
      this.reason = details.reason;
      this.unresolved = details.unresolved;
      this.draftUrl = details.draft_url;
    }
  },
}));

vi.mock('@/features/access', () => ({
  listDocumentParties: listDocumentPartiesMock,
}));

vi.mock('@/features/documents/document-lifecycle-api', () => ({
  attachSignedCopy: attachSignedCopyMock,
  correctDocumentEntry: correctDocumentEntryMock,
  listDocumentHistory: listDocumentHistoryMock,
  listSignedCopies: listSignedCopiesMock,
  listDraftComments: listDraftCommentsMock,
  replaceSignedCopy: replaceSignedCopyMock,
  signedCopyFileUrl: (documentId: string, options: { copyId?: string; download?: boolean; filename?: string } = {}) => {
    const query = new URLSearchParams();
    if (options.copyId) query.set('copy_id', options.copyId);
    if (options.download) query.set('download', '1');
    if (options.filename) query.set('filename', options.filename);
    return '/api/portal/documents/' + documentId + '/file' + (query.size ? '?' + query.toString() : '');
  },
  syncDraftComments: syncDraftCommentsMock,
  LifecycleRequestError: LifecycleRequestErrorMock,
}));

vi.mock('@/features/office/books-api', () => ({
  listRegisterBooks: listRegisterBooksMock,
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
    can_retry_processing: false,
    can_share: false,
    can_revoke: false,
  },
  summary: 'A summary generated from the document.',
  labels: ['Service agreement'],
  entities: [{ name: 'Acme Legal' }],
  risk_flags: [{ severity: 'review', detail: 'Payment term' }],
  created_at: '2026-07-28T00:00:00Z',
};

class ResizeObserverStub {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback([{ target, contentRect: { width: 500 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  disconnect() {}
  unobserve() {}
}

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
    const queryClient = useQueryClient();
    const { data = initialDocument } = useQuery({
      queryKey: ['portal-doc', initialDocument.document_id],
      queryFn: async () => initialData ?? initialDocument,
      initialData: initialData ?? initialDocument,
      staleTime: Infinity,
    });
    return <DocumentWorkspace document={data} {...workspaceProps} onDocumentUpdated={workspaceProps.onDocumentUpdated ?? ((updated) => queryClient.setQueryData(['portal-doc', initialDocument.document_id], updated))} />;
  }
  const result = render(
    <QueryClientProvider client={queryClient}>
      <WorkspaceFromQuery {...props} />
    </QueryClientProvider>,
  );
  return { ...result, invalidateQueries, queryClient };
}

describe('DocumentWorkspace', () => {
  it.each([
    ['PREPARING', 'Prepare and review the document', 'Step 1 of 4'],
    ['READY_FOR_SIGNATURE', 'Sign the document and return the PDF', 'Step 3 of 4'],
  ])('shows the dedicated drafting workflow without processing or file tabs (%s)', (lifecycle, heading, step) => {
    renderWorkspace({ document: { ...document, lifecycle, status: 'FAILED' } });
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Draft and filing progress' })).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Files' })).toBeNull();
    expect(screen.queryByText('No signed PDF is attached to this document yet.')).toBeNull();
  });

  it('does not duplicate finalized processing status in the overview', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'FINALIZED', status: 'FAILED' } });
    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByText('Processing')).toBeTruthy();
    expect(within(overview).getByText('Processing failed')).toBeTruthy();
    expect(within(overview).getByText('Finalized', { selector: 'dt' })).toBeTruthy();
  });

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    attachSignedCopyMock.mockResolvedValue(document);
    correctDocumentEntryMock.mockResolvedValue(document);
    listDocumentHistoryMock.mockResolvedValue({ document_id: 'doc-101', changes: [] });
    listRegisterBooksMock.mockResolvedValue([
      { id: 'book-101', book_number: 101, series_year: 2026, status: 'OPEN' },
      { id: 'book-102', book_number: 102, series_year: 2026, status: 'CLOSED' },
    ]);
    listDocumentPartiesMock.mockResolvedValue({
      document_id: 'doc-101',
      issuer: { id: 'owner-101', user_id: 'owner-101', email: 'lawyer@example.com', f_name: 'Jordan', l_name: 'Lawyer', role: 'owner', status: 'accepted', responded_at: null, created_at: '2026-07-28T00:00:00Z' },
      parties: [],
    });
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
    sessionStorage.clear();
  });

  it('only offers register correction for signed documents allowed by the backend', () => {
    const signedDocument = { ...document, lifecycle: 'SIGNED' };
    const permittedDocument = { ...signedDocument, permissions: { ...document.permissions, can_correct_entry: true } };

    renderWorkspace({ document: signedDocument });
    expect(screen.queryByRole('button', { name: 'Correct register entry' })).toBeNull();
    cleanup();

    renderWorkspace({ document: { ...permittedDocument, lifecycle: 'PREPARING' } });
    expect(screen.queryByRole('button', { name: 'Correct register entry' })).toBeNull();
    cleanup();

    renderWorkspace({ document: permittedDocument });
    expect(screen.getByRole('button', { name: 'Correct register entry' })).toBeTruthy();
  });

  it('corrects the register entry with positive numbers and refreshes the document', async () => {
    const signedDocument = { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions, can_correct_entry: true } };
    const updatedDocument = { ...signedDocument, book_id: 'book-102', doc_no: 14, page_no: 9 };
    correctDocumentEntryMock.mockResolvedValue(updatedDocument);
    const { queryClient } = renderWorkspace({ document: signedDocument, role: 'lawyer' });

    fireEvent.click(screen.getByRole('button', { name: 'Correct register entry' }));
    await waitFor(() => expect(listRegisterBooksMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register book' }).hasAttribute('disabled')).toBe(false);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Register book 102 — Series 2026 · Closed' }));
    fireEvent.change(screen.getByLabelText('Document number'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('Page number'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));

    await waitFor(() => expect(correctDocumentEntryMock).toHaveBeenCalledWith('doc-101', {
      book_id: 'book-102',
      doc_no: 14,
      page_no: 9,
    }));
    expect(await screen.findByText('Register entry corrected.')).toBeTruthy();
    expect(queryClient.getQueryData(['portal-doc', 'doc-101'])).toMatchObject({ book_id: 'book-102', doc_no: 14, page_no: 9 });
  });

  it('keeps the document register book as the default correction target', async () => {
    const signedDocument = { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions, can_correct_entry: true } };
    renderWorkspace({ document: signedDocument });

    fireEvent.click(screen.getByRole('button', { name: 'Correct register entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));

    await waitFor(() => expect(correctDocumentEntryMock).toHaveBeenCalledWith('doc-101', {
      book_id: 'book-101',
      doc_no: 12,
      page_no: 7,
    }));
  });

  it('keeps entered register values when correction fails', async () => {
    correctDocumentEntryMock.mockRejectedValue(new Error('Register update rejected'));
    const signedDocument = { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions, can_correct_entry: true } };
    renderWorkspace({ document: signedDocument, role: 'lawyer' });

    fireEvent.click(screen.getByRole('button', { name: 'Correct register entry' }));
    fireEvent.change(screen.getByLabelText('Document number'), { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));

    expect((await screen.findByRole('alert')).textContent).toMatch(/Register update rejected.*values have been kept/i);
    expect((screen.getByLabelText('Document number') as HTMLInputElement).value).toBe('18');
  });

  it('keeps earlier signed PDF versions in the Files tab', async () => {
    listSignedCopiesMock.mockResolvedValue({ document_id: 'doc-101', copies: [
      { id: 'copy-current', sha256: 'current-hash', content_type: 'application/pdf', size_bytes: 100, original_filename: 'current.pdf', uploaded_by: null, replaced_reason: null, is_current: true, created_at: '2026-07-28T00:00:00Z' },
      { id: 'copy-old', sha256: 'old-hash', content_type: 'application/pdf', size_bytes: 90, original_filename: 'old.pdf', uploaded_by: null, replaced_reason: 'Corrected scan', is_current: false, created_at: '2026-07-27T00:00:00Z' },
    ] });
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED' } });
    expect(listSignedCopiesMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(listSignedCopiesMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Earlier signed PDFs (1)')).toBeTruthy();
    fireEvent.click(screen.getByText('Earlier signed PDFs (1)'));
    expect(screen.getByText('old.pdf')).toBeTruthy();
    expect(screen.getByText('Reason replaced: Corrected scan')).toBeTruthy();
    fireEvent.click(screen.getByText('File details'));
    expect(screen.getByText('old-hash')).toBeTruthy();
  });

  it('attaches a signed PDF, submits the register details, and renders the returned current copy', async () => {
    const attached = { ...document, lifecycle: 'SIGNED', signed_copy: { ...document.signed_copy!, id: 'copy-attached', original_filename: 'attached.pdf' } };
    attachSignedCopyMock.mockResolvedValue(attached);
    renderWorkspace({ role: 'lawyer', document: { ...document, lifecycle: 'READY_FOR_SIGNATURE', signed_copy: null, permissions: { ...document.permissions, can_attach_signed_copy: true } } });

    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    const file = new File(['signed pdf'], 'attached.pdf', { type: 'application/pdf' });
    const uploadArea = screen.getByText('Drop your signed PDF here').closest('label');
    expect(uploadArea).not.toBeNull();
    fireEvent.drop(uploadArea!, { dataTransfer: { files: [file] } });
    expect(await screen.findByText('attached.pdf')).toBeTruthy();
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);

    await waitFor(() => expect(attachSignedCopyMock).toHaveBeenCalledWith('doc-101', file, { bookId: 'book-101', docNo: null, pageNo: null }));
    expect(await screen.findByText('Signed PDF attached.')).toBeTruthy();
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect((await screen.findByRole('link', { name: 'Download PDF' })).getAttribute('href')).toContain('copy_id=copy-attached&download=1');
  });

  it('attaches a prepared document without a book using automatic open-book numbering', async () => {
    attachSignedCopyMock.mockResolvedValue({ ...document, lifecycle: 'SIGNED', book_id: 'book-101' });
    renderWorkspace({ document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      book_id: null,
      doc_no: null,
      page_no: null,
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });

    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    await screen.findByRole('button', { name: 'Register book' });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 101/ }));
    const file = new File(['signed pdf'], 'attached.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Signed PDF'), { target: { files: [file] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);

    await waitFor(() => expect(attachSignedCopyMock).toHaveBeenCalledWith('doc-101', file, { bookId: 'book-101', docNo: null, pageNo: null }));
  });

  it('forwards explicit paper numbers when attaching to an open book manually', async () => {
    attachSignedCopyMock.mockResolvedValue({ ...document, lifecycle: 'SIGNED' });
    renderWorkspace({ document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      book_id: null,
      doc_no: null,
      page_no: null,
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 101/ }));
    fireEvent.click(screen.getByLabelText('Enter paper register numbers'));
    fireEvent.change(screen.getByLabelText('Paper document number'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Paper page number'), { target: { value: '4' } });
    const file = new File(['signed pdf'], 'attached.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Signed PDF'), { target: { files: [file] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);

    await waitFor(() => expect(attachSignedCopyMock).toHaveBeenCalledWith('doc-101', file, { bookId: 'book-101', docNo: 8, pageNo: 4 }));
  });

  it('preserves attachment selections and permits retry after a failed upload', async () => {
    attachSignedCopyMock.mockRejectedValueOnce(new Error('Storage unavailable')).mockResolvedValue(document);
    renderWorkspace({ document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      book_id: null,
      doc_no: null,
      page_no: null,
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    await screen.findByRole('button', { name: 'Register book' });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 101/ }));
    const file = new File(['signed pdf'], 'attached.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Signed PDF') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);

    expect((await screen.findByRole('alert')).textContent).toContain('Storage unavailable');
    expect(input.files?.[0]).toBe(file);
    fireEvent.submit(screen.getByRole('button', { name: 'Confirm attachment' }).closest('form')!);
    await waitFor(() => expect(attachSignedCopyMock).toHaveBeenCalledTimes(2));
  });

  it('prevents duplicate submissions while replacement is pending', async () => {
    let finishMutation: ((value: typeof document) => void) | undefined;
    replaceSignedCopyMock.mockReturnValue(new Promise((resolve) => { finishMutation = resolve; }));
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions, can_replace_signed_copy: true } } });

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
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions, can_replace_signed_copy: true } } });

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

    expect(screen.queryByRole('button', { name: 'Attach signed PDF' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Replace signed PDF' })).toBeNull();
  });

  it('keeps the document name and concise register details in Overview', async () => {
    renderWorkspace({ role: 'lawyer', document: { ...document, lifecycle: 'SIGNED' } });

    const overview = screen.getByRole('tabpanel');
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
    expect(within(overview).getByText('service-agreement.pdf')).toBeTruthy();
    await waitFor(() => expect(within(overview).getByText('Register entry').nextElementSibling?.textContent).toContain('Book 101'));
    expect(within(overview).queryByText('Processing status')).toBeNull();
  });

  it('keeps signed-copy technical metadata out of the Overview tab', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', signed_copy: null } });

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).queryByText('Signed copy content type')).toBeNull();
    expect(within(overview).queryByText('Document hash')).toBeNull();
  });

  it('does not show the drafting workflow for a direct signed-PDF upload', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', draft_url: null } });
    expect(screen.queryByRole('navigation', { name: 'Draft and filing progress' })).toBeNull();
  });

  it('shows a focused draft workspace, then the filed-document workspace after signing', () => {
    renderWorkspace();

    expect(screen.getByText('Drafting workspace')).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Potential concerns' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Signed PDF' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Open Google draft' }).getAttribute('href')).toBe(document.draft_url);

    cleanup();
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED' } });
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByRole('link', { name: 'Download current signed PDF' }).getAttribute('href')).toContain('copy_id=copy-101&download=1');
    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('No blockchain record yet')).toBeTruthy();
  });

  it('orders drafting sections as a top-to-bottom reading path', async () => {
    renderWorkspace({ role: 'lawyer' });

    const workingDraft = await screen.findByRole('heading', { name: 'Working draft' });
    const participants = await screen.findByRole('heading', { name: 'Participants' });
    const comments = await screen.findByRole('heading', { name: 'Draft comments' });
    const nextStep = await screen.findByRole('heading', { name: 'Review the draft before continuing' });

    expect(workingDraft.compareDocumentPosition(participants) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(participants.compareDocumentPosition(comments) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(comments.compareDocumentPosition(nextStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not offer readiness until the working draft is linked', () => {
    renderWorkspace({ document: {
      ...document,
      draft_url: null,
      permissions: { ...document.permissions, can_create_draft: true, can_mark_ready: true },
    } });

    expect(screen.getByRole('button', { name: 'Create blank Google draft' })).toBeTruthy();
    expect(screen.getByText(/Create or link a Google Doc to start drafting/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Mark ready for signature' })).toBeNull();
  });

  it('explains external signing and opens the signed-PDF upload form from the ready stage', async () => {
    renderWorkspace({ role: 'lawyer', document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });

    expect(screen.getByText('Ready for signature')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Approved text' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open approved Google Doc' }).getAttribute('href')).toBe(document.draft_url);
    expect(screen.getByText(/Print the approved text, collect signatures and any required notary stamp, then upload the signed PDF here\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));

    expect(screen.queryByRole('tablist')).toBeNull();
    await waitFor(() => expect(window.document.activeElement).toBe(screen.getByLabelText('Signed PDF')));
    expect(screen.getByRole('button', { name: 'Confirm attachment' })).toBeTruthy();
  });

  it('keeps the signed-PDF input anchored to its visible upload area', async () => {
    renderWorkspace({ role: 'lawyer', document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });

    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));
    const input = screen.getByLabelText('Signed PDF') as HTMLInputElement;
    const uploadArea = input.closest('label');

    expect(uploadArea?.className).toContain('relative');
    expect(input.className).toContain('absolute');
    expect(input.className).toContain('inset-0');
    expect(input.className).toContain('opacity-0');
    expect(input.className).not.toContain('sr-only');
    await waitFor(() => expect(window.document.activeElement).toBe(input));
  });

  it('can retry register-book loading before attaching the signed PDF', async () => {
    listRegisterBooksMock.mockRejectedValueOnce(new Error('Network unavailable'));
    renderWorkspace({ role: 'lawyer', document: {
      ...document,
      lifecycle: 'READY_FOR_SIGNATURE',
      signed_copy: null,
      permissions: { ...document.permissions, can_attach_signed_copy: true },
    } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Retry register books' }));
    await waitFor(() => expect(listRegisterBooksMock).toHaveBeenCalledTimes(2));
    expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows the owner-controlled next step when this lawyer cannot attach or finalize', () => {
    const readyDocument = { ...document, lifecycle: 'READY_FOR_SIGNATURE', signed_copy: null, permissions: { ...document.permissions } };
    renderWorkspace({ role: 'lawyer', document: readyDocument });
    expect(screen.getByRole('heading', { name: 'Waiting for the signed PDF' })).toBeTruthy();
    expect(screen.getByText(/document owner will attach the signed PDF/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Attach signed PDF' })).toBeNull();

    cleanup();
    const signedDocument = { ...document, lifecycle: 'SIGNED', permissions: { ...document.permissions } };
    renderWorkspace({ role: 'lawyer', document: signedDocument });
    expect(screen.getByRole('heading', { name: 'Waiting for finalization' })).toBeTruthy();
    expect(screen.getByText(/document owner will finalize the signed PDF/i)).toBeTruthy();
  });

  it('creates a blank Google draft and keeps its link separate from the signed PDF', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      if (url.searchParams.get('path') === '/documents/doc-101/draft' && init?.method === 'POST') {
        return Response.json({
          ...document,
          lifecycle: 'PREPARING',
          signed_copy: null,
          draft_url: 'https://docs.google.com/document/d/blank-draft',
          permissions: { ...document.permissions, can_mark_ready: true },
        }, { status: 201 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWorkspace({ document: { ...document, lifecycle: 'PREPARING', draft_url: null, signed_copy: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.click(await screen.findByRole('button', { name: 'Create blank Google draft' }));

    const draftLink = await screen.findByRole('link', { name: 'Open Google draft' });
    expect(draftLink.getAttribute('href')).toBe('https://docs.google.com/document/d/blank-draft');
    expect(draftLink.getAttribute('target')).toBe('_blank');
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Draft comments' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mark ready for signature' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-101%2Fdraft',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ source: 'blank' }) }),
    );
  });

  it('restores source and selected file for the matching document, then consumes the context', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-101', source: 'template', picked: { id: 'file-88', name: 'Restored template' } });
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    await waitFor(() => expect(readGoogleDraftReturnContext()).toBeNull());
    await waitFor(() => expect((screen.getByRole('combobox', { name: 'Choose a starting point' }) as HTMLSelectElement).value).toBe('template'));
    expect(screen.getByText('Selected: Restored template')).toBeTruthy();
    expect(readGoogleDraftReturnContext()).toBeNull();
  });

  it('clears a return context belonging to a different document without restoring it', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-other', source: 'existing', picked: { id: 'file-9', name: 'Other doc' } });
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    await waitFor(() => expect(readGoogleDraftReturnContext()).toBeNull());
    expect((screen.getByRole('combobox', { name: 'Choose a starting point' }) as HTMLSelectElement).value).toBe('blank');
    expect(screen.queryByText('Selected: Other doc')).toBeNull();
    expect((screen.getByRole('button', { name: 'Create blank Google draft' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('keeps the previous Picker selection when the user cancels a later selection', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_API_KEY', 'browser-key');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_APP_ID', 'cloud-project-number');
    let pickerCallback: (data: unknown) => void = () => undefined;
    let action = 'picked';
    class PickerBuilder {
      addView() { return this; }
      setOAuthToken() { return this; }
      setDeveloperKey() { return this; }
      setAppId() { return this; }
      setTitle() { return this; }
      setCallback(callback: (data: unknown) => void) { pickerCallback = callback; return this; }
      build() { return { setVisible: () => pickerCallback(action === 'picked'
        ? { action: 'picked', docs: [{ id: 'file-1', name: 'First choice' }] }
        : { action: 'cancel' }) }; }
    }
    class DocsView { setMimeTypes() { return this; } }
    Object.assign(window, {
      gapi: { load: (_library: string, callback: () => void) => callback() },
      google: { picker: { Action: { PICKED: 'picked', CANCEL: 'cancel' }, ViewId: { DOCS: 'docs' }, DocsView, PickerBuilder } },
    });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ access_token: 'picker-token', expires_at: '2099-01-01T00:00:00Z' })));
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.change(screen.getByRole('combobox', { name: 'Choose a starting point' }), { target: { value: 'template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose template' }));
    expect(await screen.findByText('Selected: First choice')).toBeTruthy();
    action = 'cancel';
    fireEvent.click(screen.getByRole('button', { name: 'Choose template' }));

    expect(await screen.findByText('Selected: First choice')).toBeTruthy();
  });

  it('clears an inaccessible picked file and allows the user to choose another', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_API_KEY', 'browser-key');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_APP_ID', 'cloud-project-number');
    let pickerCallback: (data: unknown) => void = () => undefined;
    let selection = { id: 'expired-file', name: 'Expired selection' };
    class PickerBuilder {
      addView() { return this; }
      setOAuthToken() { return this; }
      setDeveloperKey() { return this; }
      setAppId() { return this; }
      setTitle() { return this; }
      setCallback(callback: (data: unknown) => void) { pickerCallback = callback; return this; }
      build() { return { setVisible: () => pickerCallback({ action: 'picked', docs: [selection] }) }; }
    }
    class DocsView { setMimeTypes() { return this; } }
    Object.assign(window, {
      gapi: { load: (_library: string, callback: () => void) => callback() },
      google: { picker: { Action: { PICKED: 'picked', CANCEL: 'cancel' }, ViewId: { DOCS: 'docs' }, DocsView, PickerBuilder } },
    });
    let created = false;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), window.location.origin);
      if (url.searchParams.get('path') === '/google/picker-token') return Response.json({ access_token: 'picker-token', expires_at: '2099-01-01T00:00:00Z' });
      if (url.searchParams.get('path') === '/documents/doc-101/draft') {
        created = true;
        return Response.json({ detail: 'The selected Google Doc is unavailable.' }, { status: 400 });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.change(screen.getByRole('combobox', { name: 'Choose a starting point' }), { target: { value: 'existing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose existing Google Doc' }));
    expect(await screen.findByText('Selected: Expired selection')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use selected Google Doc' }));
    await waitFor(() => expect(created).toBe(true));

    expect(screen.queryByText('Selected: Expired selection')).toBeNull();
    expect((screen.getByRole('combobox', { name: 'Choose a starting point' }) as HTMLSelectElement).value).toBe('existing');
    expect((screen.getByRole('button', { name: 'Use selected Google Doc' }) as HTMLButtonElement).disabled).toBe(true);
    selection = { id: 'new-file', name: 'New selection' };
    fireEvent.click(screen.getByRole('button', { name: 'Choose existing Google Doc' }));
    expect(await screen.findByText('Selected: New selection')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Use selected Google Doc' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('does not render a backend-provided draft URL outside Google Docs', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', draft_url: 'https://example.com/phishing' } });

    expect(screen.queryByRole('link', { name: 'Open Google draft' })).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('invalid Google draft link');
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByRole('link', { name: 'Download current signed PDF' }).getAttribute('href')).toContain('copy_id=copy-101&download=1');
  });

  it.each(['GOOGLE_NOT_CONNECTED', 'GOOGLE_RECONNECT_REQUIRED'])(
    'keeps a picked template after %s and allows retry', async (reason) => {
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
        if (createCount === 1) return Response.json({ message: 'Reconnect Google Drive.', details: { reason } }, { status: 409 });
        return Response.json({ ...document, draft_url: 'https://docs.google.com/document/d/template-draft' }, { status: 201 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWorkspace({ document: { ...document, draft_url: null, permissions: { ...document.permissions, can_create_draft: true } } });

    fireEvent.change(await screen.findByRole('combobox', { name: 'Choose a starting point' }), { target: { value: 'template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose template' }));
    expect(await screen.findByText(/Client template/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Copy selected template' }));

    expect(await screen.findByRole('link', { name: 'Connect Google in account settings' })).toBeTruthy();
    expect(screen.getByText(/Client template/)).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Choose a starting point' }) as HTMLSelectElement).value).toBe('template');
    fireEvent.click(screen.getByRole('button', { name: 'Copy selected template' }));
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

    fireEvent.change(screen.getByRole('combobox', { name: 'Choose a starting point' }), { target: { value: 'template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose template' }));

    expect(await screen.findByRole('link', { name: 'Connect Google in account settings' })).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Choose a starting point' }) as HTMLSelectElement).value).toBe('template');
    fireEvent.change(screen.getByRole('combobox', { name: 'Choose a starting point' }), { target: { value: 'blank' } });
    expect(screen.queryByRole('link', { name: 'Connect Google in account settings' })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('explains unavailable data without inventing controls or restricted workflow actions', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', status: 'PROCESSING', signed_copy: null, draft_url: null, summary: null, labels: [], entities: [], risk_flags: [] } });

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByText('No signed PDF is attached to this document yet.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /signed PDF/i })).toBeNull();
    expect(screen.queryByText(/AI-generated assistance/i)).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('No blockchain record yet')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Anchor|Finalize|Confirm record/i })).toBeNull();
  });

  it('shortens and lets the user copy the document hash in Blockchain details', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'FINALIZED', on_chain: true, document_hash: 'a'.repeat(64) } });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('aaaaaaaaaa…aaaaaaaa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy document hash' })).toBeTruthy();
  });

  it('renders a mismatched integrity record with the warning treatment', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED', document_hash: 'a'.repeat(64) } });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('No blockchain record yet')).toBeTruthy();
  });

  it('shows an on-chain anchor only when the backend reports one', () => {
    renderWorkspace({ document: { ...document, on_chain: true, lifecycle: 'FINALIZED', document_hash: 'chain-hash' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText('Saved to the blockchain')).toBeTruthy();
    expect(screen.getByText('chain-hash')).toBeTruthy();
  });

  it('renders one-key insight objects as readable key-value details', () => {
    renderWorkspace({ document: { ...document, lifecycle: 'SIGNED' } });

    expect(screen.getByText('name — Acme Legal')).toBeTruthy();
  });

  it('keeps a document read-only when its backend permissions deny actions', () => {
    renderWorkspace();

    expect(screen.queryByText('Document lifecycle')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it('shows participant management in context when the backend grants permission', () => {
    renderWorkspace({ role: 'lawyer', document: { ...document, permissions: { ...document.permissions, can_share: true } } });

    expect(screen.getByRole('link', { name: 'Manage' }).getAttribute('href'))
      .toBe('/portal/documents/doc-101/participants');
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('shows the document owner and participants in the drafting workspace', async () => {
    listDocumentPartiesMock.mockResolvedValue({
      document_id: 'doc-101',
      issuer: { id: 'owner-101', user_id: 'owner-101', email: 'lawyer@example.com', f_name: 'Jordan', l_name: 'Lawyer', role: 'owner', status: 'accepted', responded_at: null, created_at: '2026-07-28T00:00:00Z' },
      parties: [{ id: 'party-1', user_id: 'user-1', document_id: 'doc-101', email: 'reviewer@example.com', f_name: 'Avery', l_name: 'Reviewer', role: 'viewer', status: 'accepted' }],
    });
    renderWorkspace({ role: 'user' });

    expect(await screen.findByText('Jordan Lawyer')).toBeTruthy();
    expect(await screen.findByText('Avery Reviewer')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Participants' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Participants' }).textContent).toContain('Jordan Lawyer');
    expect(screen.getByRole('list', { name: 'Participants' }).textContent).toContain('Avery Reviewer');
    expect(screen.getByText('Lawyer')).toBeTruthy();
    expect(screen.getByText('Viewer · Has access')).toBeTruthy();
    expect(screen.queryByText('reviewer@example.com')).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('lets the user retry failed draft comments and participant loads', async () => {
    listDocumentPartiesMock.mockRejectedValueOnce(new Error('Network unavailable'));
    listDraftCommentsMock.mockRejectedValueOnce(new Error('Network unavailable'));
    renderWorkspace();

    fireEvent.click(await screen.findByRole('button', { name: 'Retry participants' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Retry comments' }));

    await waitFor(() => expect(listDocumentPartiesMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(listDraftCommentsMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('No comments found in the draft.')).toBeTruthy();
    expect(await screen.findByText('Jordan Lawyer')).toBeTruthy();
  });

  it('shows synced draft comments and blocks readiness while comments remain unresolved', async () => {
    listDraftCommentsMock.mockResolvedValue({
      document_id: 'doc-101', unresolved: 1, synced_at: '2026-07-28T00:00:00Z',
      comments: [{ id: 'comment-1', author_name: 'Reviewer', is_lawyer: true, content: 'Please correct this clause.', quoted_text: 'Payment is due.', resolved: false, created_at: '2026-07-28T00:00:00Z', replies: [{ author_name: 'Issuer', is_lawyer: false, content: 'I will update it.', created_at: '2026-07-28T00:01:00Z' }] }],
    });
    syncDraftCommentsMock.mockRejectedValue(new Error('Google Docs is unavailable'));
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_mark_ready: true } }, readinessError: new Error('UNRESOLVED_COMMENTS: resolve all threads') });

    expect(screen.getByRole('alert').textContent).toContain('UNRESOLVED_COMMENTS');
    expect((screen.getByRole('button', { name: 'Mark ready for signature' }) as HTMLButtonElement).disabled).toBe(true);
    expect(await screen.findByText(/Resolve 1 unresolved comment in Google Docs, then refresh comments/)).toBeTruthy();
    expect(await screen.findByText('Please correct this clause.')).toBeTruthy();
    expect(screen.getByText('Payment is due.')).toBeTruthy();
    expect(screen.getByText('I will update it.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh comments' }));
    expect(await screen.findByText('Google Docs is unavailable')).toBeTruthy();
    expect(screen.getByText('Please correct this clause.')).toBeTruthy();
  });

  it('publishes comments returned by manual sync to the visible comment list', async () => {
    listDraftCommentsMock.mockResolvedValue({ document_id: 'doc-101', unresolved: 1, comments: [] });
    syncDraftCommentsMock.mockResolvedValue({
      document_id: 'doc-101', unresolved: 0,
      comments: [{ id: 'comment-synced', author_name: 'Reviewer', content: 'Resolved externally.', resolved: true, created_at: '2026-07-28T00:00:00Z' }],
    });
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_mark_ready: true } } });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh comments' }));

    expect(await screen.findByText('Resolved externally.')).toBeTruthy();
    expect(screen.getByText('0 unresolved · Last checked Not available')).toBeTruthy();
    await waitFor(() => expect((screen.getByRole('button', { name: 'Mark ready for signature' }) as HTMLButtonElement).disabled).toBe(false));
  });

  it('guides clients to comments and lawyers to review pending suggestions before readiness', async () => {
    renderWorkspace({ role: 'user' });
    expect(await screen.findByText(/Leave feedback with comments \(select text, then choose the comment button\), not by editing the document\./)).toBeTruthy();
    expect(screen.getByText(/Google Docs suggestions are not shown here/)).toBeTruthy();

    cleanup();
    renderWorkspace({ role: 'lawyer', document: { ...document, permissions: { ...document.permissions, can_mark_ready: true } } });
    expect(screen.getByText(/Resolve comments and pending Google Docs suggestions before marking the draft ready/)).toBeTruthy();
    expect(screen.getByText(/Afterward, clients can read the draft but cannot comment\. Reopen it if revisions are needed\./)).toBeTruthy();
  });

  it('shows mirrored thread actions and only validated unresolved readiness details', async () => {
    listDraftCommentsMock.mockResolvedValue({
      document_id: 'doc-101', unresolved: 2, comments: [{
        id: 'comment-2', author_name: 'Client Name', author_user_id: null, content: 'Please revise.', quoted_text: 'Original text',
        resolved: false, created_at: '2026-07-28T00:00:00Z', replies: [
          { author_name: 'Lawyer', content: 'Resolved in Google Docs.', action: 'resolve' },
          { author_name: 'Client Name', content: 'Reopened in Google Docs.', action: 'reopen' },
          { author_name: 'Lawyer', content: 'Follow-up note.', action: 'comment' },
        ],
      }],
    });
    const readinessError = new LifecycleRequestError('Resolve two threads.', 409, {
      reason: 'UNRESOLVED_COMMENTS', unresolved: 2, draft_url: 'https://docs.google.com/document/d/draft-101',
    });
    renderWorkspace({ document: { ...document, permissions: { ...document.permissions, can_mark_ready: true } }, readinessError });

    expect(screen.getByRole('alert').textContent).toContain('Resolve two threads.');
    expect(screen.getByText('2 unresolved comments remain.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open Google draft to resolve comments' }).getAttribute('href'))
      .toBe('https://docs.google.com/document/d/draft-101');
    expect(await screen.findByText('Client Name')).toBeTruthy();
    expect(screen.getByText('Original text')).toBeTruthy();
    expect(screen.getByText(/Resolved thread/)).toBeTruthy();
    expect(screen.getByText(/Reopened thread/)).toBeTruthy();
    expect(screen.queryByText('Commented')).toBeNull();

    cleanup();
    const unsafeError = new LifecycleRequestError('Resolve comments.', 409, {
      reason: 'UNRESOLVED_COMMENTS', draft_url: 'https://evil.example/document',
    });
    renderWorkspace({ readinessError: unsafeError });
    expect((await screen.findByRole('alert')).textContent).toContain('Resolve comments.');
    expect(screen.queryByText(/unresolved comments remain/)).toBeNull();
    expect(screen.queryByRole('link', { name: 'Open Google draft to resolve comments' })).toBeNull();
  });

  it('hides readiness controls when the backend denies the permissions', () => {
    renderWorkspace();
    expect(screen.queryByRole('button', { name: 'Mark ready for signature' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reopen draft' })).toBeNull();
  });
});
