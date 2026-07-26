// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';

const profile = vi.hoisted(() => ({ role: 'document_participant' }));
const useQuery = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({ useQuery }));

afterEach(() => {
  cleanup();
  useQuery.mockReset();
});

describe('DashboardPage', () => {
  it('denies participants before requesting or rendering issuer dashboard data', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') return { data: { role: profile.role }, isLoading: false };
      if (options.enabled !== false) throw new Error(`Issuer query should be disabled: ${options.queryKey[0]}`);
      return { data: undefined, isLoading: false };
    });

    render(<DashboardPage />);

    expect(screen.getByText('The Document Issuer Portal dashboard is available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByText('Recent documents')).toBeNull();
    expect(screen.queryByText('Documents needing attention')).toBeNull();
  });

  it('labels the issuer dashboard as the Document Issuer Portal', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') return { data: { role: 'document_issuer' }, isLoading: false };
      return { data: [], isLoading: false };
    });

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Document Issuer Portal' })).toBeTruthy();
  });

  it('reassures issuers when no documents need attention', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') return { data: { role: 'document_issuer' }, isLoading: false };
      return { data: [], isLoading: false };
    });

    render(<DashboardPage />);

    expect(screen.getByText('No action required. All documents are progressing normally.')).toBeTruthy();
  });
});
