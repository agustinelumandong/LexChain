// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import OfficeReportsPage from './page';

afterEach(cleanup);

describe('OfficeReportsPage', () => {
  it('shows local reports with unavailable demo downloads', () => {
    render(<OfficeReportsPage />);

    expect(screen.getAllByRole('button', { name: 'Download unavailable in demo mode' })).not.toHaveLength(0);
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });
});
