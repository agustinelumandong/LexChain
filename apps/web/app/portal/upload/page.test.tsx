// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UploadPage from './page';

const { uploadDocumentMock } = vi.hoisted(() => ({ uploadDocumentMock: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@mui/icons-material/UploadFile', () => ({ default: () => null }));
vi.mock('@mui/icons-material/InsertDriveFile', () => ({ default: () => null }));
vi.mock('@mui/icons-material/Close', () => ({ default: () => null }));
vi.mock('@mui/icons-material/CheckCircle', () => ({ default: () => null }));
vi.mock('../lib/portal-upload', async (importOriginal) => ({
  ...await importOriginal<typeof import('../lib/portal-upload')>(),
  uploadDocument: uploadDocumentMock,
}));
vi.mock('@tanstack/react-query', async () => {
  const React = await import('react');

  return {
    useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-profile'
      ? { data: { role: 'lawyer' }, isPending: false }
      : { data: [{ id: 'book-1', book_number: '42', series_year: 2026, is_full: false }], isLoading: false, isError: false },
    useMutation: (options: { mutationFn: () => Promise<unknown>; onSuccess?: (data: unknown) => void }) => {
      const [state, setState] = React.useState<{ error: unknown; isPending: boolean }>({ error: null, isPending: false });

      return {
        ...state,
        mutate: () => {
          setState({ error: null, isPending: true });
          void options.mutationFn().then((data) => {
            setState({ error: null, isPending: false });
            options.onSuccess?.(data);
          }).catch((error: unknown) => setState({ error, isPending: false }));
        },
        reset: () => setState({ error: null, isPending: false }),
      };
    },
  };
});

function completeUploadForm(container: HTMLElement) {
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(fileInput, { target: { files: [new File(['PDF'], 'deed.pdf', { type: 'application/pdf' })] } });
  fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'book-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm and process' }));
}

describe('UploadPage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the accepted document ID and status returned by the upload service', async () => {
    uploadDocumentMock.mockResolvedValue({ document_id: 'document-202', status: 'QUEUED', message: 'Accepted for processing.' });
    const { container } = render(<UploadPage />);

    completeUploadForm(container);

    expect(await screen.findByText('document-202')).toBeTruthy();
    expect(screen.getByText('QUEUED')).toBeTruthy();
    expect(uploadDocumentMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'deed', bookId: 'book-1' }));
  });

  it('renders an inline alert when the upload service rejects the document', async () => {
    uploadDocumentMock.mockRejectedValue(new Error('The PDF is too large.'));
    const { container } = render(<UploadPage />);

    completeUploadForm(container);

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('The PDF is too large.'));
  });
});
