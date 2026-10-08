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
  it('shows documented result identifiers and opens the matching document', async () => {
    fetchMock.mockResolvedValue(Response.json({ query: 'lease', results: [
      { chunk_id: 'chunk-1', document_id: 'document-12345678', chunk_index: 2, score: 0.91 },
    ] }));
    render(<PortalSearchBar />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Search documents' }), { target: { value: 'lease' } });
    const result = await screen.findByRole('option', { name: /document id: document-12345678.*chunk index: 2.*score: 0.91/i });
    fireEvent.mouseDown(result);

    expect(pushMock).toHaveBeenCalledWith('/portal/documents/document-12345678');
  });

  it('distinguishes no matches from a failed search request', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ query: 'missing', results: [] }))
      .mockResolvedValueOnce(Response.json({ message: 'offline' }, { status: 503 }));
    render(<PortalSearchBar />);
    const input = screen.getByRole('combobox', { name: 'Search documents' });

    fireEvent.change(input, { target: { value: 'missing' } });
    expect(await screen.findByText('No results found')).toBeTruthy();

    fireEvent.change(input, { target: { value: 'offline' } });
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Search failed'));
    expect(screen.queryByText('No results found')).toBeNull();
  });
});
