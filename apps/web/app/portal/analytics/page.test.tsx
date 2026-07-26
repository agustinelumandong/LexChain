// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOfficeInsightMetrics, type PortalDocument } from '../lib/office-insight';
import OfficeAnalyticsPage from './page';

const queryState = vi.hoisted(() => ({
  role: 'document_issuer',
  documents: [] as Array<Record<string, unknown>>,
  documentsError: false,
  documentsLoading: false,
}));
const useQuery = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({ useQuery }));

afterEach(() => {
  cleanup();
  useQuery.mockReset();
  vi.useRealTimers();
});
beforeEach(() => {
  queryState.role = 'document_issuer';
  queryState.documents = [];
  queryState.documentsError = false;
  queryState.documentsLoading = false;
  useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
    if (options.queryKey[0] === 'portal-profile') {
      return { data: { role: queryState.role }, isLoading: false, isError: false };
    }
    if (options.enabled === false) return { data: undefined, isLoading: false, isError: false };
    return {
      data: queryState.documents,
      isLoading: queryState.documentsLoading,
      isError: queryState.documentsError,
    };
  });
});

describe('OfficeAnalyticsPage', () => {
  it('derives totals from shared documents inside the selected date range', () => {
    const documents: PortalDocument[] = [
      { created_at: '2026-07-24T00:00:00.000Z', integrity_state: 'match', on_chain: true },
      { created_at: '2026-07-10T00:00:00.000Z', integrity_state: 'mismatch', on_chain: false },
      { created_at: '2026-04-01T00:00:00.000Z', integrity_state: 'match', on_chain: true },
    ];

    expect(getOfficeInsightMetrics(documents, '7-days', new Date('2026-07-26T00:00:00.000Z'))).toEqual([
      { label: 'Documents created', value: 1 },
      { label: 'Integrity matches', value: 1 },
      { label: 'On-chain records', value: 1 },
    ]);
    expect(getOfficeInsightMetrics(documents, '30-days', new Date('2026-07-26T00:00:00.000Z'))).toEqual([
      { label: 'Documents created', value: 2 },
      { label: 'Integrity matches', value: 1 },
      { label: 'On-chain records', value: 1 },
    ]);
  });

  it('renders shared document totals and updates them when the range changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-26T00:00:00.000Z'));
    queryState.documents = [
      { document_id: 'recent', created_at: '2026-07-24T00:00:00.000Z', integrity_state: 'match', on_chain: true },
      { document_id: 'older', created_at: '2026-07-10T00:00:00.000Z', integrity_state: 'mismatch', on_chain: false },
    ];

    render(<OfficeAnalyticsPage />);

    expect(screen.getByText('Documents created').parentElement?.textContent).toContain('2');
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
    expect(screen.getByText('Documents created').parentElement?.textContent).toContain('1');
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });

  it('shows an honest empty state when no shared documents are in range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-26T00:00:00.000Z'));
    render(<OfficeAnalyticsPage />);

    expect(screen.getByRole('status').textContent).toContain('No document activity is available for this demo period.');
  });

  it('does not present zero totals as real data when the shared document request fails', () => {
    queryState.documentsError = true;

    render(<OfficeAnalyticsPage />);

    expect(screen.getByRole('alert').textContent).toContain('We could not load office analytics data.');
    expect(screen.queryByLabelText('Office analytics')).toBeNull();
  });

  it('announces when shared analytics data is loading', () => {
    queryState.documentsLoading = true;

    render(<OfficeAnalyticsPage />);

    expect(screen.getByRole('status').textContent).toContain('Loading office analytics data');
  });

  it('denies participants before requesting or rendering analytics data', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') {
        return { data: { role: 'document_participant' }, isLoading: false, isError: false };
      }
      if (options.enabled !== false) throw new Error('Participant analytics query must be disabled');
      return { data: undefined, isLoading: false, isError: false };
    });

    render(<OfficeAnalyticsPage />);

    expect(screen.getByText('Office Analytics is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Office analytics')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });
});
