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

function setupFetch(uploadResponses: Response[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const path = new URL(url, window.location.origin).searchParams.get('path') ?? '';
    if (path === '/users/') return Response.json({ role: 'document_issuer' });
    if (path === '/books/?limit=50&offset=0') return Response.json([{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }]);
    if (init?.method === 'POST') return uploadResponses.shift() ?? Response.json(signedDocument, { status: 201 });
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
  it('shows the created signed document and opens its detail instead of processing poll', async () => {
    setupFetch([Response.json(signedDocument, { status: 201 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));

    expect(await screen.findByText('Signed')).toBeTruthy();
    expect(screen.getByText('No processing status yet')).toBeTruthy();
    expect(screen.getByText(/Document number 12 · Page 3/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View document' }));
    expect(push).toHaveBeenCalledWith('/portal/documents/signed-doc-42');
  });

  it('retries the same closed-book upload only after the documented confirmation', async () => {
    const fetchMock = setupFetch([
      Response.json({ detail: 'READY_FOR_SIGNATURE_EXISTS' }, { status: 409 }),
      Response.json(signedDocument, { status: 201 }),
    ]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm as new record' }));

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
    setupFetch([Response.json({ detail: 'READY_FOR_SIGNATURE_EXISTS' }, { status: 409 })]);
    renderPage();
    await fillClosedBookUpload();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and file' }));
    await screen.findByRole('button', { name: 'Confirm as new record' });
    expect((screen.getByLabelText('Document title') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.getByLabelText('Document title')).toHaveProperty('value', 'Signed deed');
    await waitFor(() => expect((screen.getByLabelText('Document title') as HTMLInputElement).disabled).toBe(false));
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
    expect(screen.queryByRole('button', { name: 'Confirm as new record' })).toBeNull();
    expect(screen.getByLabelText('Paper document number')).toHaveProperty('value', '12');
    expect(screen.getByText(/Signed deed\.pdf/)).toBeTruthy();
  });
});
