// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortalSearchBar } from './portal-search-bar';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

const fetchMock = vi.fn();

beforeEach(() => {
  pushMock.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PortalSearchBar', () => {
  it('shows human-readable record details alongside match data and opens the document', async () => {
    fetchMock.mockResolvedValue(Response.json({ query: 'lease', results: [
      {
        chunk_id: 'chunk-1',
        document_id: 'document-12345678',
        chunk_index: 2,
        score: 0.91,
        file_name: 'Lease Agreement.pdf',
        created_at: '2026-10-20T00:00:00Z',
        register_reference: {
          doc_no: 12,
          page_no: 7,
          book_number: 3,
          series_year: 2026,
          label: 'Doc. No. 12, Page No. 7, Book No. 3, Series of 2026',
        },
      },
    ] }));
    render(<PortalSearchBar />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Quick text search' }), { target: { value: 'lease' } });
    const result = await screen.findByRole('option', { name: /Lease Agreement\.pdf/ });
    expect(result.textContent).toContain('Document created: Oct 20, 2026');
    expect(result.textContent).toContain('Doc. No. 12, Page No. 7, Book No. 3, Series of 2026');
    expect(result.textContent).toContain('Chunk index: 2 · Score: 0.91');
    fireEvent.mouseDown(result);

    expect(pushMock).toHaveBeenCalledWith('/portal/documents/document-12345678');
  });

  it('omits the register reference when a search result is unregistered', async () => {
    fetchMock.mockResolvedValue(Response.json({ query: 'draft', results: [{
      chunk_id: 'chunk-2',
      document_id: 'document-87654321',
      chunk_index: 0,
      score: 0.81,
      file_name: 'Unfiled draft.pdf',
      created_at: '2026-10-21T00:00:00Z',
      register_reference: null,
    }] }));
    render(<PortalSearchBar />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Quick text search' }), { target: { value: 'draft' } });
    const result = await screen.findByRole('option', { name: /Unfiled draft\.pdf/ });

    expect(result.textContent).toContain('Document created: Oct 21, 2026');
    expect(result.textContent).not.toContain('Register reference:');
  });

  it('distinguishes no matches from a failed search request', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ query: 'missing', results: [] }))
      .mockResolvedValueOnce(Response.json({ message: 'offline' }, { status: 503 }));
    render(<PortalSearchBar />);
    const input = screen.getByRole('combobox', { name: 'Quick text search' });

    fireEvent.change(input, { target: { value: 'missing' } });
    expect(await screen.findByText('No results found')).toBeTruthy();

    fireEvent.change(input, { target: { value: 'offline' } });
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('offline'));
    expect(screen.queryByText('No results found')).toBeNull();
  });
});
