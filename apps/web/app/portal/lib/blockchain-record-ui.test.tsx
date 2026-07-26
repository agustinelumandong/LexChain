// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlockchainRecordCard } from '../components/blockchain-record-card';
import BlockchainRecordsPage from '../blockchain-records/page';
import { getBlockchainRecordFields } from './blockchain-record-ui';

const useQuery = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({ useQuery }));

const record = {
  document_id: 'document-123',
  tx_hash: '0xtransaction',
  onchain_document_id: 'onchain-document-123',
  data_hash: '0xdatahash',
  transacttion_link: 'https://example.test/transaction/0xtransaction',
};

const demoRecord = {
  ...record,
  tx_hash: '0xdemo-transaction-placeholder-000001',
  data_hash: '0xdemo-data-placeholder-000001',
  transacttion_link: 'https://example.test/demo-transaction',
};

afterEach(() => {
  cleanup();
  useQuery.mockReset();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
    if (options.queryKey[0] === 'portal-profile') {
      return { data: { role: 'document_issuer' }, isLoading: false, isError: false };
    }
    return { data: [record], isLoading: false, isError: false };
  });
});

describe('BlockchainRecordCard', () => {
  it('renders local RecordResponse mock fields without calling an API client', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(createElement(BlockchainRecordCard, { record }));

    expect(screen.getByText('Document ID')).toBeTruthy();
    expect(screen.getByText('On-chain document ID')).toBeTruthy();
    expect(screen.getByText('Transaction link')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /anchor/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /anchor/i })).toBeNull();
  });

  it('uses only the fields available from RecordResponse', () => {
    expect(getBlockchainRecordFields(record).map((field) => field.label)).toEqual([
      'Document ID',
      'Transaction hash',
      'On-chain document ID',
      'Data hash',
      'Transaction link',
    ]);
  });

  it('shortens demo hashes and omits its fake explorer URL', () => {
    expect(getBlockchainRecordFields(demoRecord)).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Transaction hash', value: '0xdemo-tra…000001' }),
      expect.objectContaining({ label: 'Data hash', value: '0xdemo-dat…000001' }),
    ]));
    expect(getBlockchainRecordFields(demoRecord)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Transaction link' }),
    ]));
  });

  it('loads verification records for every seeded on-chain document through the portal proxy', async () => {
    let recordsQuery: (() => Promise<unknown>) | undefined;
    useQuery.mockImplementation((options: {
      queryKey: string[];
      queryFn: () => Promise<unknown>;
      enabled?: boolean;
    }) => {
      if (options.queryKey[0] === 'portal-profile') {
        return { data: { role: 'document_issuer' }, isLoading: false, isError: false };
      }
      recordsQuery = options.queryFn;
      return { data: undefined, isLoading: true, isError: false };
    });
    const fetchMock = vi.fn(async (input: string) => {
      const requestUrl = new URL(input, 'https://lexchain.test');
      const path = requestUrl.searchParams.get('path');
      if (path === '/documents/') {
        return Response.json([
          { document_id: 'chain-a', on_chain: true },
          { document_id: 'local-only', on_chain: false },
          { document_id: 'chain-b', on_chain: true },
        ]);
      }
      return Response.json({
        ...record,
        document_id: path?.split('/').at(-1),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<BlockchainRecordsPage />);

    expect(recordsQuery).toBeTypeOf('function');
    await expect(recordsQuery!()).resolves.toEqual([
      expect.objectContaining({ document_id: 'chain-a' }),
      expect.objectContaining({ document_id: 'chain-b' }),
    ]);
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url), 'https://lexchain.test').searchParams.get('path'))).toEqual([
      '/documents/',
      '/blockchain/verify/chain-a',
      '/blockchain/verify/chain-b',
    ]);
  });

  it('renders shared verification records and labels them as demo data', () => {
    render(<BlockchainRecordsPage />);

    expect(screen.getByText('document-123')).toBeTruthy();
    expect(screen.getByText('Demo data — changes reset when this page is refreshed.')).toBeTruthy();
  });

  it('shows an honest empty state when the shared data has no on-chain documents', () => {
    useQuery.mockImplementation((options: { queryKey: string[] }) => (
      options.queryKey[0] === 'portal-profile'
        ? { data: { role: 'document_issuer' }, isLoading: false, isError: false }
        : { data: [], isLoading: false, isError: false }
    ));

    render(<BlockchainRecordsPage />);

    expect(screen.getByText('No anchored records are available in this demo.')).toBeTruthy();
  });

  it('announces when shared blockchain records are loading', () => {
    useQuery.mockImplementation((options: { queryKey: string[] }) => (
      options.queryKey[0] === 'portal-profile'
        ? { data: { role: 'document_issuer' }, isLoading: false, isError: false }
        : { data: undefined, isLoading: true, isError: false }
    ));

    render(<BlockchainRecordsPage />);

    expect(screen.getByRole('status').textContent).toContain('Loading blockchain records');
  });

  it('shows an honest error when shared blockchain records cannot load', () => {
    useQuery.mockImplementation((options: { queryKey: string[] }) => (
      options.queryKey[0] === 'portal-profile'
        ? { data: { role: 'document_issuer' }, isLoading: false, isError: false }
        : { data: undefined, isLoading: false, isError: true }
    ));

    render(<BlockchainRecordsPage />);

    expect(screen.getByRole('alert').textContent).toContain('We could not load blockchain verification records.');
    expect(screen.queryByText('No anchored records are available in this demo.')).toBeNull();
  });

  it('keeps blockchain records issuer-only', () => {
    useQuery.mockImplementation((options: { queryKey: string[]; enabled?: boolean }) => {
      if (options.queryKey[0] === 'portal-profile') {
        return { data: { role: 'document_participant' }, isLoading: false, isError: false };
      }
      if (options.enabled !== false) throw new Error('Participant records query must be disabled');
      return { data: undefined, isLoading: false, isError: false };
    });

    render(<BlockchainRecordsPage />);

    expect(screen.getByText('Blockchain records are available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByText('Demo data — changes reset when this page is refreshed.')).toBeNull();
  });
});
