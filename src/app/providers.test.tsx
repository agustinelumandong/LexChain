// @vitest-environment jsdom
import { focusManager, useQuery } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Providers } from './providers';

const fetchStatus = vi.fn();

function StatusProbe() {
  const { data } = useQuery({ queryKey: ['focus-status'], queryFn: fetchStatus });
  return <p>{data ?? 'Loading status'}</p>;
}

afterEach(() => {
  cleanup();
  focusManager.setFocused(undefined);
  fetchStatus.mockReset();
});

describe('Providers', () => {
  it('refreshes active query data when the user returns to the tab', async () => {
    fetchStatus.mockResolvedValue('Latest status');
    render(<Providers><StatusProbe /></Providers>);
    expect(await screen.findByText('Latest status')).toBeTruthy();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    await waitFor(() => expect(fetchStatus).toHaveBeenCalledTimes(2));
  });
});
