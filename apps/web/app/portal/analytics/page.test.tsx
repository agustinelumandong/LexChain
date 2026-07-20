// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OfficeAnalyticsPage from './page';

const profile = vi.hoisted(() => ({ role: 'lawyer' }));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { role: profile.role }, isLoading: false }),
}));

afterEach(cleanup);
beforeEach(() => { profile.role = 'lawyer'; });

describe('OfficeAnalyticsPage', () => {
  it('renders local date ranges and an accessible demo snapshot', () => {
    render(<OfficeAnalyticsPage />);

    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Totals shown are seeded for this demo period.');
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });

  it('denies participants before rendering local analytics data', () => {
    profile.role = 'user';
    render(<OfficeAnalyticsPage />);

    expect(screen.getByText('Office Analytics is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Office analytics')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });
});
