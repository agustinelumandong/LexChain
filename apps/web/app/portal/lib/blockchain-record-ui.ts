import type { components } from '@lexchain/types';

export type BlockchainRecordUi = Pick<
  components['schemas']['RecordResponse'],
  'document_id' | 'tx_hash' | 'onchain_document_id' | 'data_hash' | 'transacttion_link'
>;

export type BlockchainRecordField = {
  label: 'Document ID' | 'Transaction hash' | 'On-chain document ID' | 'Data hash' | 'Transaction link';
  value: string;
};

function shortenHash(value: string): string {
  return value.length > 16 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

export function getBlockchainRecordFields(record?: BlockchainRecordUi | null): BlockchainRecordField[] {
  if (!record) return [];

  return [
    { label: 'Document ID', value: record.document_id },
    { label: 'Transaction hash', value: shortenHash(record.tx_hash) },
    { label: 'On-chain document ID', value: record.onchain_document_id },
    { label: 'Data hash', value: shortenHash(record.data_hash) },
    ...(record.transacttion_link.includes('/demo-') ? [] : [{ label: 'Transaction link' as const, value: record.transacttion_link }]),
  ];
}
