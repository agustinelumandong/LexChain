import type { components } from '@lexchain/types';

export type BlockchainRecordUi = Pick<
  components['schemas']['RecordResponse'],
  'document_id' | 'tx_hash' | 'onchain_document_id' | 'data_hash' | 'transacttion_link'
>;

export type BlockchainRecordField = {
  label: 'Document ID' | 'Transaction hash' | 'On-chain document ID' | 'Data hash' | 'Transaction link';
  value: string;
};

export function getBlockchainRecordFields(record?: BlockchainRecordUi | null): BlockchainRecordField[] {
  if (!record) return [];

  return [
    { label: 'Document ID', value: record.document_id },
    { label: 'Transaction hash', value: record.tx_hash },
    { label: 'On-chain document ID', value: record.onchain_document_id },
    { label: 'Data hash', value: record.data_hash },
    { label: 'Transaction link', value: record.transacttion_link },
  ];
}
