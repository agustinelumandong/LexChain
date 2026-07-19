// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import OfficeAnalyticsPage from './page';

afterEach(cleanup);

describe('OfficeAnalyticsPage', () => {
  it('renders local date ranges and an accessible zero-data state', () => {
    render(<OfficeAnalyticsPage />);

    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('No office activity is available for this demo period.');
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });
});
