// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import OfficeReportsPage from './reports-page';

const { profileQuery } = vi.hoisted(() => {
  const available = { data: { role: 'lawyer' }, isLoading: false, isError: false, isFetching: false, error: null, refetch: vi.fn() } as Record<string, unknown>;
  return { profileQuery: { current: available, available } };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-profile'
    ? profileQuery.current
    : { isLoading: false, isError: true },
}));
vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn().mockRejectedValue(new Error('Report fetch failed')) }));
vi.mock('@/features/admin/generated-reports', () => ({ GeneratedReportsManagementView: () => null }));

afterEach(() => {
  cleanup();
  profileQuery.current = profileQuery.available;
});

describe('Document Activity report', () => {
  it('does not display a successful report when fetching fails', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Report fetch failed');
    expect(screen.queryByRole('button', { name: 'Download CSV' })).toBeNull();
    expect(screen.queryByText('Ready')).toBeNull();
  });

  it('offers a retry instead of denying access when the profile check fails', () => {
    const refetch = vi.fn();
    profileQuery.current = { data: undefined, isLoading: false, isError: true, isFetching: false, error: new Error('Service temporarily unavailable.'), refetch };
    render(<OfficeReportsPage />);

    expect(screen.getByRole('heading', { name: 'Could not verify portal access' })).toBeTruthy();
    expect(screen.queryByText('Reports are available to Lawyers only.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry access check' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
