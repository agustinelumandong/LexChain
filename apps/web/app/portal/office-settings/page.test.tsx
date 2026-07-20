// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import OfficeSettingsPage from './page';

const profile = vi.hoisted(() => ({ role: 'user' }));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { role: profile.role }, isLoading: false }),
}));

afterEach(cleanup);

describe('OfficeSettingsPage', () => {
  it('denies participants before rendering local office settings data', () => {
    render(<OfficeSettingsPage />);

    expect(screen.getByText('Office Settings are available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByLabelText('Office settings')).toBeNull();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });

  it('does not expose session or other technical settings to issuers', () => {
    profile.role = 'lawyer';
    render(<OfficeSettingsPage />);

    expect(screen.getByLabelText('Office settings')).toBeTruthy();
    expect(screen.queryByLabelText('Session timeout')).toBeNull();
  });

  it('identifies valid local changes before they are saved', () => {
    profile.role = 'lawyer';
    render(<OfficeSettingsPage />);

    fireEvent.change(screen.getByLabelText('Invitation expiry'), { target: { value: '8' } });

    expect(screen.getByRole('status').textContent).toContain('Unsaved changes');
  });
});
