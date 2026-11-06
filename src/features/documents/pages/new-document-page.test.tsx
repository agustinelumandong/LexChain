// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NewDocumentPage from './new-document-page';

const { push, openRecord } = vi.hoisted(() => ({ push: vi.fn(), openRecord: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/features/documents/document-draft-api', () => ({ openDocumentRecord: openRecord }));
vi.mock('@/features/documents/components/google-draft-panel', () => ({ GoogleDraftPanel: () => <div>Choose a starting point</div> }));
vi.mock('@/features/documents/pages/upload-page', () => ({ default: ({ onPendingChange }: { onPendingChange: (pending: boolean) => void }) => <><label>Document title<input /></label><button onClick={() => onPendingChange(true)}>Start upload</button><button onClick={() => onPendingChange(false)}>Finish upload</button></> }));
vi.mock('@/features/documents/pages/documents-id-page', () => ({ default: () => <div>Document workspace</div> }));

function renderPage(initialPath: 'google' | 'pdf' = 'google') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><NewDocumentPage initialPath={initialPath} /></QueryClientProvider>);
}
afterEach(() => { cleanup(); vi.clearAllMocks(); window.history.replaceState(null, '', '/'); });

describe('new document', () => {
  it.each(['google', 'pdf'] as const)('links back to documents from the %s starting path', (path) => {
    renderPage(path);
    expect(screen.getByRole('link', { name: 'Back to documents' }).getAttribute('href')).toBe('/portal/documents');
  });

  it('opens the signed PDF path when linked from upload', () => {
    renderPage('pdf');
    expect(screen.getByLabelText('Document title')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upload a signed PDF' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Step 1 of 4')).toBeTruthy();
  });
  it('hides page navigation while uploading and restores it afterward', () => {
    renderPage('pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Start upload' }));
    expect(screen.queryByRole('link', { name: 'Back to documents' })).toBeNull();
    expect(screen.queryByRole('group', { name: 'Document starting point' })).toBeNull();
    expect(screen.queryByText('Step 1 of 4')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Finish upload' }));
    expect(screen.getByRole('link', { name: 'Back to documents' })).toBeTruthy();
    expect(screen.getByText('Step 1 of 4')).toBeTruthy();
  });
  it('continues to the starting point on the same page without router navigation', async () => {
    openRecord.mockResolvedValue({ document_id: 'doc-1', file_name: 'Agreement', lifecycle: 'PREPARING', draft_url: null, permissions: { can_create_draft: true } });
    renderPage();
    fireEvent.change(screen.getByLabelText('Document name'), { target: { value: 'Agreement' } });
    expect(screen.getByRole('heading', { name: 'Agreement' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to starting point' }));
    expect(await screen.findByText('Document workspace')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Prepare with Google Docs/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Upload a signed PDF/ })).toBeNull();
    expect(push).not.toHaveBeenCalled();
    expect(openRecord).toHaveBeenCalledWith('Agreement');
    expect(window.location.pathname).toBe('/portal/documents/doc-1');
    expect(openRecord).toHaveBeenCalledTimes(1);
  });

  it('switches paths without losing form entries or navigating', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Document name'), { target: { value: 'Agreement' } });
    fireEvent.click(screen.getByRole('button', { name: /Upload a signed PDF/ }));
    fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Signed deed' } });
    fireEvent.click(screen.getByRole('button', { name: /Prepare with Google Docs/ }));
    expect((screen.getByLabelText('Document name') as HTMLInputElement).value).toBe('Agreement');
    fireEvent.click(screen.getByRole('button', { name: /Upload a signed PDF/ }));
    expect((screen.getByLabelText('Document title') as HTMLInputElement).value).toBe('Signed deed');
    expect(push).not.toHaveBeenCalled();
  });

  it('preserves the name after a failure', async () => {
    openRecord.mockRejectedValue(new Error('Try again later.'));
    renderPage();
    fireEvent.change(screen.getByLabelText('Document name'), { target: { value: 'Agreement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to starting point' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Try again later.');
    expect((screen.getByLabelText('Document name') as HTMLInputElement).value).toBe('Agreement');
  });

  it('shows the page loading state while opening a record and restores the form on failure', async () => {
    let fail!: (error: Error) => void;
    openRecord.mockReturnValue(new Promise((_, reject) => { fail = reject; }));
    renderPage();
    fireEvent.change(screen.getByLabelText('Document name'), { target: { value: 'Agreement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to starting point' }));
    expect(await screen.findByRole('progressbar', { name: 'Opening your document…' })).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Document starting point' })).toBeNull();
    fail(new Error('Try again later.'));
    expect((await screen.findByRole('alert')).textContent).toContain('Try again later.');
    expect((screen.getByLabelText('Document name') as HTMLInputElement).value).toBe('Agreement');
  });
});
