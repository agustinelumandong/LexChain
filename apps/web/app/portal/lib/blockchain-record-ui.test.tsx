// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it } from 'vitest';
import { BlockchainRecordCard } from '../components/blockchain-record-card';

afterEach(cleanup);

describe('BlockchainRecordCard', () => {
  it('renders No anchored record with no anchor action when no record is returned', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(createElement(QueryClientProvider, { client: queryClient }, createElement(BlockchainRecordCard)));

    expect(screen.getByText('No anchored record')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /anchor/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /anchor/i })).toBeNull();
  });
});
