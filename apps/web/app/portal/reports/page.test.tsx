// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OfficeReportsPage from './page';

const profile = vi.hoisted(() => ({ role: 'lawyer' }));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { role: profile.role }, isLoading: false }),
}));

afterEach(cleanup);
beforeEach(() => { profile.role = 'lawyer'; });

describe('OfficeReportsPage', () => {
  it('shows local reports as preview-only in demo mode', () => {
    render(<OfficeReportsPage />);

    expect(screen.getAllByText('Preview only in demo mode')).not.toHaveLength(0);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });

  it('denies participants before rendering local report data', () => {
    profile.role = 'user';
    render(<OfficeReportsPage />);

    expect(screen.getByText('Office Reports are available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Available office reports')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });
});
