// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UploadPage from '@/features/documents/pages/upload-page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const signedDocument = {
  document_id: 'signed-doc-42',
  file_name: 'Signed deed.pdf',
  lifecycle: 'SIGNED',
  status: null,
  on_chain: false,
  signed_copy: null,
  draft_url: null,
  document_hash: null,
  book_id: 'closed-book',
  doc_no: 12,
  page_no: 3,
  finalized_at: null,
  finalized_by: null,
  cancelled_at: null,
  permissions: {
    can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: false,
    can_reopen: false, can_attach_signed_copy: false, can_replace_signed_copy: false,
    can_correct_entry: false, can_cancel: false, can_finalize: false, can_share: false, can_revoke: false,
  },
  summary: null,
  labels: [],
  entities: [],
  risk_flags: [],
  created_at: '2026-10-08T10:00:00Z',
  updated_at: null,
};

function setupFetch(
  uploadResponses: Response[],
  books = [{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }],
  attachResponses: Array<Response | Promise<Response>> = [],
) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const path = new URL(url, window.location.origin).searchParams.get('path') ?? '';
    if (path === '/users/') return Response.json({ role: 'document_issuer' });
    if (path === '/books/?limit=50&offset=0') return Response.json(books);
    if (init?.method === 'POST') {
      return path.includes('/signed-copy')
        ? attachResponses.shift() ?? Response.json({ ...signedDocument, document_id: path.match(/documents\/([^/]+)/)?.[1] }, { status: 200 })
        : uploadResponses.shift() ?? Response.json(signedDocument, { status: 201 });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={queryClient}><UploadPage /></QueryClientProvider>);
}

async function fillClosedBookUpload() {
  await screen.findByRole('button', { name: 'Register book' });
  await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
  fireEvent.click(await screen.findByRole('option', { name: /Register book 4/ }));
  fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Signed deed' } });
  fireEvent.change(screen.getByLabelText('Paper document number'), { target: { value: '12' } });
  fireEvent.change(screen.getByLabelText('Paper page number'), { target: { value: '3' } });
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [new File(['signed pdf'], 'Signed deed.pdf', { type: 'application/pdf' })] },
  });
  await screen.findByText(/Signed deed\.pdf/);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('signed document upload screen', () => {
  it('omits processing status from a SIGNED upload result', async () => {
    setupFetch([Response.json({ ...signedDocument, status: 'FAILED' }, { status: 201 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    expect(await screen.findByText('Signed document filed')).toBeTruthy();
    expect(screen.getByText('Signed')).toBeTruthy();
    expect(screen.queryByText('Processing status')).toBeNull();
    expect(screen.queryByText(/^(Failed|Processing failed)$/)).toBeNull();
  });

  it('navigates to the created signed document instead of processing poll', async () => {
    setupFetch([Response.json(signedDocument, { status: 201 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/signed-doc-42'));
  });

  it('omits numbers for open-book automatic filing and sends both when manually entered', async () => {
    const fetchMock = setupFetch([Response.json(signedDocument, { status: 201 })], [{ id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' }]);
    renderPage();
    await screen.findByRole('button', { name: 'Register book' });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 5/ }));
    fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Signed deed' } });
    fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [new File(['signed pdf'], 'Signed deed.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/signed-doc-42'));
    let uploadCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    let uploadPath = new URL(String(uploadCall[0]), window.location.origin).searchParams.get('path')!;
    expect(new URLSearchParams(uploadPath.split('?')[1]).has('doc_no')).toBe(false);
    expect(new URLSearchParams(uploadPath.split('?')[1]).has('page_no')).toBe(false);
    expect(((uploadCall[1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');

    cleanup();
    vi.clearAllMocks();
    const manualFetchMock = setupFetch([Response.json(signedDocument, { status: 201 })], [{ id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' }]);
    renderPage();
    await screen.findByRole('button', { name: 'Register book' });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 5/ }));
    fireEvent.click(screen.getByLabelText('Enter paper register numbers'));
    fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Signed deed' } });
    fireEvent.change(screen.getByLabelText('Paper document number'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Paper page number'), { target: { value: '4' } });
    fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [new File(['signed pdf'], 'Signed deed.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/signed-doc-42'));
    uploadCall = manualFetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    uploadPath = new URL(String(uploadCall[0]), window.location.origin).searchParams.get('path')!;
    expect(new URLSearchParams(uploadPath.split('?')[1]).get('doc_no')).toBe('8');
    expect(new URLSearchParams(uploadPath.split('?')[1]).get('page_no')).toBe('4');
  });

  it('keeps number errors in the summary when manual-number controls are hidden', async () => {
    setupFetch([Response.json({
      message: 'Filing failed.',
      details: { errors: [{ field: 'doc_no', message: 'Document number is unavailable.' }] },
    }, { status: 422 })], [{ id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' }]);
    renderPage();
    await screen.findByRole('button', { name: 'Register book' });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Register book' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.click(await screen.findByRole('option', { name: /Register book 5/ }));
    fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Signed deed' } });
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [new File(['signed pdf'], 'Signed deed.pdf', { type: 'application/pdf' })] },
    });
    await screen.findByText(/Signed deed\.pdf/);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    expect(await screen.findByText('doc_no: Document number is unavailable.')).toBeTruthy();
    expect(document.getElementById('upload-doc-no')).toBeNull();
  });

  it('retries the same closed-book upload only after the documented confirmation', async () => {
    const fetchMock = setupFetch([
      Response.json({ detail: 'READY_FOR_SIGNATURE_EXISTS' }, { status: 409 }),
      Response.json(signedDocument, { status: 201 }),
    ]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'No, this is a new document' }));

    expect(await screen.findByText('Signed')).toBeTruthy();
    const uploadCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(uploadCalls).toHaveLength(2);
    const uploadPaths = uploadCalls.map(([url]) => new URL(String(url), window.location.origin).searchParams.get('path') ?? '');
    expect(uploadPaths[0]).toContain('doc_no=12');
    expect(uploadPaths[0]).toContain('page_no=3');
    expect(uploadPaths[1]).toContain('confirm_new_record=true');
    expect(((uploadCalls[0][1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');
    expect(((uploadCalls[1][1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');
  });

  it('keeps selections when the user cancels the confirmation', async () => {
    const duplicateKeyWarnings: unknown[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation((message) => {
      if (typeof message === 'string' && message.includes('same key')) duplicateKeyWarnings.push(message);
    });
    setupFetch([Response.json({
      message: 'A signed copy is expected.',
      details: {
        reason: 'READY_FOR_SIGNATURE_EXISTS',
        errors: [
          { field: 'file_name', message: 'Please review this upload.' },
          { field: 'file_name', message: 'Please review this upload.' },
        ],
      },
    }, { status: 409 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    await screen.findByRole('button', { name: 'No, this is a new document' });
    expect(screen.getAllByText('file_name: Please review this upload.')).toHaveLength(2);
    expect(duplicateKeyWarnings).toEqual([]);
    consoleError.mockRestore();
    expect((document.getElementById('upload-title') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(await screen.findByRole('button', { name: 'Return without submitting' }));

    expect(document.getElementById('upload-title')).toHaveProperty('value', 'Signed deed');
    await waitFor(() => expect((document.getElementById('upload-title') as HTMLInputElement).disabled).toBe(false));
    expect(screen.getByLabelText('Paper document number')).toHaveProperty('value', '12');
    expect(screen.getByLabelText('Paper page number')).toHaveProperty('value', '3');
    expect(screen.getByText(/Signed deed\.pdf/)).toBeTruthy();
  });

  it('shows other conflicts as errors and keeps the selected PDF and filing details', async () => {
    setupFetch([Response.json({ detail: 'Page is full' }, { status: 409 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Page is full');
    expect(screen.queryByRole('button', { name: 'No, this is a new document' })).toBeNull();
    expect(screen.getByLabelText('Paper document number')).toHaveProperty('value', '12');
    expect(screen.getByText(/Signed deed\.pdf/)).toBeTruthy();
  });

  it('offers waiting documents with party details and attaches the selected PDF using its filing data', async () => {
    const conflict = {
      message: 'A signed copy is still expected for these documents.',
      details: {
        reason: 'READY_FOR_SIGNATURE_EXISTS',
        related_documents: [{
          document_id: 'waiting-doc',
          file_name: 'Prepared deed',
          parties: [{ f_name: 'Avery', l_name: 'Reviewer', email: 'avery@example.com', role: 'signer' }],
        }],
        errors: [],
      },
    };
    const fetchMock = setupFetch(
      [Response.json(conflict, { status: 409 })],
      [{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }],
      [Response.json({ ...signedDocument, document_id: 'waiting-doc' }, { status: 200 })],
    );
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    expect(await screen.findByText(conflict.message)).toBeTruthy();
    expect(screen.getByText('Prepared deed')).toBeTruthy();
    expect(screen.getByText(/Avery Reviewer.*avery@example\.com.*signer/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/waiting-doc'));
    const requests = fetchMock.mock.calls.filter(([url]) => new URL(String(url), window.location.origin).searchParams.has('path'));
    const uploadRequest = requests.find(([, init]) => init?.method === 'POST' && !(new URL(String(requests[0][0]), window.location.origin).searchParams.get('path') ?? '').includes('/signed-copy'));
    const attachmentRequest = requests.find(([url]) => (new URL(String(url), window.location.origin).searchParams.get('path') ?? '').includes('/signed-copy'));
    const attachmentPath = new URL(String(attachmentRequest?.[0]), window.location.origin).searchParams.get('path')!;
    expect(new URLSearchParams(attachmentPath.split('?')[1])).toMatchObject(new URLSearchParams({ book_id: 'closed-book', doc_no: '12', page_no: '3' }));
    expect(((uploadRequest?.[1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');
    expect(((attachmentRequest?.[1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');
  });

  it('prevents removing the selected PDF while a waiting-document attachment is pending', async () => {
    const conflict = { message: 'A signed copy is expected.', details: { reason: 'READY_FOR_SIGNATURE_EXISTS', related_documents: [{ document_id: 'waiting-doc', file_name: 'Prepared deed' }] } };
    let finishAttachment!: (response: Response) => void;
    const pendingAttachment = new Promise<Response>((resolve) => { finishAttachment = resolve; });
    const fetchMock = setupFetch(
      [Response.json(conflict, { status: 409 })],
      [{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }],
      [pendingAttachment],
    );
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Attach signed PDF to Prepared deed' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => (new URL(String(url), window.location.origin).searchParams.get('path') ?? '').includes('/signed-copy'))).toBe(true));

    expect(screen.getByRole('button', { name: 'Remove uploaded file' })).toHaveProperty('disabled', true);
    finishAttachment(Response.json({ ...signedDocument, document_id: 'waiting-doc' }, { status: 200 }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/waiting-doc'));
  });

  it('only creates a separate record after explicit choice and preserves the selected PDF', async () => {
    const fetchMock = setupFetch([
      Response.json({ message: 'A signed copy is still expected.', details: { reason: 'READY_FOR_SIGNATURE_EXISTS', related_documents: [] } }, { status: 409 }),
      Response.json({ message: 'Temporary filing failure.' }, { status: 503 }),
      Response.json(signedDocument, { status: 201 }),
    ]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    await screen.findByRole('button', { name: 'No, this is a new document' });
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'No, this is a new document' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Temporary filing failure.'));
    expect(screen.getByText(/Signed deed\.pdf/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/signed-doc-42'));
    const uploadCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(uploadCalls).toHaveLength(3);
    const retryPath = new URL(String(uploadCalls[2][0]), window.location.origin).searchParams.get('path')!;
    expect(new URLSearchParams(retryPath.split('?')[1]).get('confirm_new_record')).toBe('true');
    expect(((uploadCalls[2][1]?.body as FormData).get('file') as File).name).toBe('Signed deed.pdf');
  });

  it('links duplicate uploads to the returned document and displays validation details', async () => {
    const duplicateKeyWarnings: unknown[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation((message) => {
      if (typeof message === 'string' && message.includes('same key')) duplicateKeyWarnings.push(message);
    });
    setupFetch([Response.json({
      message: 'This file is already filed.',
      details: { reason: 'DUPLICATE_FILE', document_id: 'duplicate-doc', errors: [
        { field: 'doc_no', message: 'Document number is already used.' },
        { field: 'doc_no', message: 'Use a positive number.' },
        { field: 'doc_no', message: 'Use a positive number.' },
        { field: 'unknown_column', message: 'This field is not available in the form.' },
        { message: 'The backend returned an unassociated validation message.' },
        null,
        42,
      ] },
    }, { status: 409 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    expect((await screen.findByRole('alert')).textContent).toContain('This file is already filed.');
    expect(screen.getByText('Document number is already used.')).toBeTruthy();
    expect(screen.getAllByText('Use a positive number.')).toHaveLength(2);
    expect(screen.getByText('unknown_column: This field is not available in the form.')).toBeTruthy();
    expect(screen.getByText('The backend returned an unassociated validation message.')).toBeTruthy();
    expect(screen.getAllByText('The backend returned an unreadable validation error.')).toHaveLength(2);
    expect(duplicateKeyWarnings).toEqual([]);
    consoleError.mockRestore();
    expect(document.getElementById('upload-doc-no')!.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('upload-doc-no')!.getAttribute('aria-describedby')).toBe('upload-doc-no-error');
    expect(document.querySelectorAll('#upload-doc-no-error')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'View existing document' }).getAttribute('href')).toBe('/portal/documents/duplicate-doc');
    expect(screen.queryByRole('button', { name: 'No, this is a new document' })).toBeNull();
    expect(document.getElementById('upload-doc-no')).toHaveProperty('value', '12');
    expect(screen.getByText(/Signed deed\.pdf/)).toBeTruthy();
  });

  it('shows attachment validation while retaining initial upload recovery details', async () => {
    const conflict = {
      message: 'A signed copy is expected.',
      details: {
        reason: 'READY_FOR_SIGNATURE_EXISTS',
        related_documents: [{ document_id: 'waiting-doc', file_name: 'Prepared deed' }],
        errors: [{ field: 'initial_field', message: 'Initial upload validation.' }],
      },
    };
    setupFetch(
      [Response.json(conflict, { status: 409 })],
      [{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }],
      [Response.json({ message: 'Attachment rejected.', details: { errors: [{ field: 'attachment_field', message: 'Attachment validation.' }] } }, { status: 422 })],
    );
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Attach signed PDF to Prepared deed' }));

    expect(await screen.findByText('attachment_field: Attachment validation.')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Upload recovery' }).textContent).toContain('initial_field: Initial upload validation.');
    expect(screen.queryByText('initial_field: Initial upload validation.', { selector: '[role="alert"] p' })).toBeNull();
  });
});
