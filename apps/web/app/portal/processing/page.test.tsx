// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProcessingMonitorPage from './page';

const queryState = vi.hoisted(() => ({
  role: 'user',
  documents: [] as Array<Record<string, unknown>>,
  documentsError: false,
}));
const useQuery = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({ useQuery }));

afterEach(() => {
  cleanup();
  useQuery.mockReset();
});
beforeEach(() => {
  queryState.role = 'user';
  queryState.documents = [];
  queryState.documentsError = false;
  useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
    if (options.queryKey[0] === 'portal-profile') {
      return { data: { role: queryState.role }, isLoading: false, isError: false };
    }
    if (options.enabled === false) {
      return { data: undefined, isLoading: false, isError: false };
    }
    return {
      data: queryState.documents,
      isLoading: false,
      isError: queryState.documentsError,
    };
  });
});

describe('ProcessingMonitorPage', () => {
  it('denies participants before requesting or rendering monitor data', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') {
        return { data: { role: 'user' }, isLoading: false, isError: false };
      }
      if (options.enabled !== false) throw new Error('Participant document query must be disabled');
      return { data: undefined, isLoading: false, isError: false };
    });

    render(<ProcessingMonitorPage />);

    expect(screen.getByText('Processing Monitor is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Document processing stages')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });

  it('renders processing rows from the shared document response', () => {
    queryState.role = 'lawyer';
    queryState.documents = [{
      document_id: 'response-failed-document',
      file_name: 'Unreadable filing.pdf',
      status: 'failed',
      failure_reason: 'The PDF could not be opened.',
      created_at: '2026-07-25T00:00:00.000Z',
      on_chain: false,
    }];

    render(<ProcessingMonitorPage />);

    expect(screen.getByRole('link', { name: 'Unreadable filing.pdf' }).getAttribute('href')).toBe('/portal/documents/response-failed-document');
    expect(screen.getByText('Failure reason: The PDF could not be opened.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open document' }).getAttribute('href')).toBe('/portal/documents/response-failed-document');
    expect(screen.getByRole('link', { name: 'Upload replacement PDF for Unreadable filing.pdf' }).getAttribute('href')).toBe('/portal/upload');
    expect(screen.queryByRole('button', { name: 'Retry processing' })).toBeNull();
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });

  it('shows honest empty and error states for the shared document response', () => {
    queryState.role = 'lawyer';
    const { rerender } = render(<ProcessingMonitorPage />);

    expect(screen.getByText('No document processing records are available in this demo.')).toBeTruthy();

    queryState.documentsError = true;
    rerender(<ProcessingMonitorPage />);

    expect(screen.getByRole('alert').textContent).toContain('We could not load document processing data.');
  });
});
