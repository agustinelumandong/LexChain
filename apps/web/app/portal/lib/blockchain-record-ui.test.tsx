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

  it('does not import or invoke the anchoring API from the record UI', () => {
    const componentSource = readFileSync(resolve(import.meta.dirname, '../components/blockchain-record-card.tsx'), 'utf8');
    const pageSource = readFileSync(resolve(import.meta.dirname, '../blockchain-records/page.tsx'), 'utf8');

    expect(componentSource).not.toContain("from '../lib/integrity-api'");
    expect(componentSource).not.toMatch(/getBlockchainRecord\s*\(/);
    expect(componentSource).not.toContain('/api/portal/blockchain/record');
    expect(pageSource).not.toContain('/api/portal/blockchain/record');
    expect(componentSource).not.toMatch(/network|timestamp/i);
  });
});
