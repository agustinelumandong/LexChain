// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import OfficeReportsPage from './reports-page';

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-profile'
    ? { data: { role: 'lawyer' }, isLoading: false }
    : { isLoading: false, isError: true },
}));
vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn().mockRejectedValue(new Error('Report fetch failed')) }));
vi.mock('@/features/admin/generated-reports', () => ({ GeneratedReportsManagementView: () => null }));

afterEach(cleanup);

describe('Document Activity report', () => {
  it('does not display a successful report when fetching fails', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Download CSV' })).toBeNull();
    expect(screen.queryByText('Ready')).toBeNull();
  });
});
