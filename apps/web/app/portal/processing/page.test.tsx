// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessingMonitorPage from './page';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { role: 'user' }, isLoading: false }),
}));

afterEach(cleanup);

describe('ProcessingMonitorPage', () => {
  it('denies participants before rendering local monitor data', () => {
    render(<ProcessingMonitorPage />);

    expect(screen.getByText('Processing Monitor is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Document processing stages')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });
});
