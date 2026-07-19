export type BlockchainRecordUi = {
  data_hash?: string | null;
  tx_hash?: string | null;
  network?: string | null;
  onchain_timestamp?: string | number | null;
  timestamp?: string | number | null;
};

export type BlockchainRecordField = {
  label: 'Hash' | 'Transaction' | 'Network' | 'Timestamp';
  value: string;
};

export function getBlockchainRecordFields(record?: BlockchainRecordUi | null): BlockchainRecordField[] {
  if (!record) return [];

  const timestamp = record.onchain_timestamp ?? record.timestamp;

  return [
    record.data_hash && { label: 'Hash' as const, value: record.data_hash },
    record.tx_hash && { label: 'Transaction' as const, value: record.tx_hash },
    record.network && { label: 'Network' as const, value: record.network },
    timestamp !== undefined && timestamp !== null && { label: 'Timestamp' as const, value: String(timestamp) },
  ].filter((field): field is BlockchainRecordField => Boolean(field));
}
