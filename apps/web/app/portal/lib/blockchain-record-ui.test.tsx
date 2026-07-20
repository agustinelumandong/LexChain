// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockchainRecordCard } from '../components/blockchain-record-card';
import { getBlockchainRecordFields } from './blockchain-record-ui';

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

afterEach(cleanup);

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

  it('does not import or invoke the anchoring API from the record UI', () => {
    const componentSource = readFileSync(resolve(import.meta.dirname, '../components/blockchain-record-card.tsx'), 'utf8');
    const pageSource = readFileSync(resolve(import.meta.dirname, '../blockchain-records/page.tsx'), 'utf8');

    expect(componentSource).not.toContain("from '../lib/integrity-api'");
    expect(componentSource).not.toMatch(/getBlockchainRecord\s*\(/);
    expect(componentSource).not.toContain('/api/portal/blockchain/record');
    expect(pageSource).not.toContain('/api/portal/blockchain/record');
    expect(pageSource).toContain('Demo data — changes reset when this page is refreshed.');
    expect(componentSource).not.toMatch(/network|timestamp/i);
  });
});
