// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/features/portal/pages/dashboard-page';
import { PortalRoleProvider } from '@/features/access/components';

const queryState = vi.hoisted(() => ({
  role: 'lawyer',
  documents: [] as Array<Record<string, unknown>>,
  documentsError: false,
}));
const useQuery = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({ useQuery }));

function renderDashboard() {
  return render(<PortalRoleProvider roleHint={queryState.role}><DashboardPage /></PortalRoleProvider>);
}

afterEach(() => {
  cleanup();
  useQuery.mockReset();
});

beforeEach(() => {
  queryState.role = 'lawyer';
  queryState.documents = [];
  queryState.documentsError = false;
  useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
    if (options.enabled === false) return { data: undefined, isLoading: false, isError: false };
    if (options.queryKey[0] === 'portal-documents') {
      return {
        data: queryState.documents,
        isLoading: false,
        isError: queryState.documentsError,
        refetch: vi.fn(),
      };
    }
    if (options.queryKey[0] === 'portal-notif-count') {
      return { data: { unread: 0 }, isLoading: false, isError: false };
    }
    if (options.queryKey[0] === 'admin-dashboard') {
      return { data: null, isLoading: false, isError: false };
    }
    throw new Error(`Unexpected query: ${options.queryKey[0]}`);
  });
});

describe('DashboardPage', () => {
  it('denies participants before requesting or rendering issuer dashboard data', () => {
    queryState.role = 'document_participant';
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.enabled !== false) throw new Error(`Issuer query should be disabled: ${options.queryKey[0]}`);
      return { data: undefined, isLoading: false };
    });

    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Document Portal' })).toBeTruthy();
    expect(screen.getByText('Welcome to the Document Portal')).toBeTruthy();
    expect(screen.getByText('Browse shared documents, manage invitations, and request e-copies from the navigation menu.')).toBeTruthy();
    expect(useQuery).not.toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['portal-profile'] }));
  });

  it('uses the sign-in role hint for its dashboard without a profile request', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Lawyer Portal' })).toBeTruthy();
    expect(useQuery).not.toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['portal-profile'] }));
  });

  it('reassures issuers when no documents need attention', () => {
    renderDashboard();

    expect(screen.getByText('No action required. All documents are progressing normally.')).toBeTruthy();
  });

  it('keeps the dashboard focused on document operations without analytics snapshots', () => {
    queryState.documents = [
      { id: 'failed', file_name: 'Failed.pdf', status: 'FAILED', created_at: '2026-07-24T00:00:00.000Z', on_chain: false },
    ];

    renderDashboard();

    expect(screen.getByText('Failed Documents').parentElement?.textContent).toContain('1');
    expect(screen.queryByRole('heading', { name: 'Office activity' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Management snapshot' })).toBeNull();
  });

  it('does not present repository failures as zero totals or healthy document states', () => {
    queryState.documentsError = true;

    renderDashboard();

    expect(screen.getByRole('alert').textContent).toContain('We could not load your document repository.');
    expect(screen.getByText('Total Documents')).toBeTruthy();
    expect(screen.queryByText('No action required. All documents are progressing normally.')).toBeNull();
    expect(screen.queryByText('No documents are processing right now.')).toBeNull();
    expect(screen.getByText('Attention status is unavailable.')).toBeTruthy();
    expect(screen.getByText('Processing status is unavailable.')).toBeTruthy();
  });
});
