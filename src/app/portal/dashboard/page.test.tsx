// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/features/portal/pages/dashboard-page';
import { PortalRoleProvider } from '@/features/access/components';

const queryState = vi.hoisted(() => ({
  role: 'lawyer',
  documents: [] as Array<Record<string, unknown>>,
  documentsError: false,
  adminDashboard: null as Record<string, number> | null,
  adminDashboardLoading: false,
  adminDashboardError: false,
  adminDashboardRefetch: vi.fn(),
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
  queryState.adminDashboard = null;
  queryState.adminDashboardLoading = false;
  queryState.adminDashboardError = false;
  queryState.adminDashboardRefetch = vi.fn();
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
      return {
        data: queryState.adminDashboard,
        isLoading: queryState.adminDashboardLoading,
        isError: queryState.adminDashboardError,
        refetch: queryState.adminDashboardRefetch,
      };
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

  it('renders all administrator dashboard values using their contract meanings', () => {
    queryState.adminDashboard = {
      total_users: 120,
      total_lawyers: 25,
      total_documents: 2340,
      total_processed: 2100,
      total_failed: 30,
      total_on_chain: 1980,
      pending_invitations: 8,
    };

    renderDashboard();

    expect(screen.getByText('Total Lawyers').parentElement?.textContent).toContain('25');
    expect(screen.getByText('Total Users').parentElement?.textContent).toContain('120');
    expect(screen.getByText('Total Documents').parentElement?.textContent).toContain('2,340');
    expect(screen.getByText('Total Processed').parentElement?.textContent).toContain('2,100');
    expect(screen.getByText('Total Failed').parentElement?.textContent).toContain('30');
    expect(screen.getByText('Total On Chain').parentElement?.textContent).toContain('1,980');
    expect(screen.getByText('Pending Invitations').parentElement?.textContent).toContain('8');
  });

  it('shows valid zero dashboard values as zero', () => {
    queryState.adminDashboard = {
      total_users: 0,
      total_lawyers: 0,
      total_documents: 0,
      total_processed: 0,
      total_failed: 0,
      total_on_chain: 0,
      pending_invitations: 0,
    };

    renderDashboard();

    expect(screen.getAllByText('0')).toHaveLength(7);
    expect(screen.queryByText('Unavailable')).toBeNull();
  });

  it('shows a loading state while administrator metrics are being fetched', () => {
    queryState.adminDashboardLoading = true;

    renderDashboard();

    expect(screen.getByLabelText('Loading dashboard metrics')).toBeTruthy();
    expect(screen.queryByText('Unavailable')).toBeNull();
  });

  it('shows unavailable dashboard metrics without substituting document counts', () => {
    queryState.documents = [
      { id: 'failed', file_name: 'Failed.pdf', status: 'FAILED', created_at: '2026-07-24T00:00:00.000Z', on_chain: false },
    ];

    renderDashboard();

    expect(screen.getAllByText('Unavailable')).toHaveLength(7);
    expect(screen.getByText('Dashboard metrics are unavailable.')).toBeTruthy();
    expect(screen.queryByText('Failed Documents')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Office activity' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Management snapshot' })).toBeNull();
  });

  it('shows and retries dashboard service failures', () => {
    queryState.adminDashboardError = true;

    renderDashboard();

    expect(screen.getByText('We could not load administrator dashboard metrics.')).toBeTruthy();
    expect(screen.getAllByText('Unavailable')).toHaveLength(7);
    fireEvent.click(screen.getByRole('button', { name: 'Retry dashboard metrics' }));
    expect(queryState.adminDashboardRefetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Failed Documents')).toBeNull();
  });

  it('does not present repository failures as zero totals or healthy document states', () => {
    queryState.documentsError = true;

    renderDashboard();

    expect(screen.getByText('We could not load your document repository.')).toBeTruthy();
    expect(screen.getByText('Total Documents')).toBeTruthy();
    expect(screen.queryByText('No action required. All documents are progressing normally.')).toBeNull();
    expect(screen.queryByText('No documents are processing right now.')).toBeNull();
    expect(screen.getByText('Attention status is unavailable.')).toBeTruthy();
    expect(screen.getByText('Processing status is unavailable.')).toBeTruthy();
  });
});
