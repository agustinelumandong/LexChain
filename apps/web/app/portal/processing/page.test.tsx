// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProcessingMonitorPage from './page';

const profile = vi.hoisted(() => ({ role: 'user' }));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { role: profile.role }, isLoading: false }),
}));

afterEach(cleanup);
beforeEach(() => { profile.role = 'user'; });

describe('ProcessingMonitorPage', () => {
  it('denies participants before rendering local monitor data', () => {
    render(<ProcessingMonitorPage />);

    expect(screen.getByText('Processing Monitor is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Document processing stages')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });

  it('offers honest recovery actions for failed processing', () => {
    profile.role = 'lawyer';
    render(<ProcessingMonitorPage />);

    expect(screen.getByRole('link', { name: 'Open document' }).getAttribute('href')).toBe('/portal/documents/demo-failed-lease');
    expect(screen.getByRole('link', { name: 'Upload replacement PDF for Commercial Lease — Mabini Avenue' }).getAttribute('href')).toBe('/portal/upload');
    expect(screen.getByRole('button', { name: 'Retry processing' }).disabled).toBe(true);
    expect(screen.getByText('Retry processing is not available in demo mode.')).toBeTruthy();
  });
});
