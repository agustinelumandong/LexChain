'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { BlockchainRecordCard } from '../components/blockchain-record-card';
import { getPortalUiRole } from '../lib/portal-role';
import type { BlockchainRecordUi } from '../lib/blockchain-record-ui';

type UserProfile = ApiSchema<'UserProfileResponse'>;

const mockBlockchainRecords: BlockchainRecordUi[] = [
  {
    document_id: 'mock-document-1',
    tx_hash: '0xmocktransactionhash',
    onchain_document_id: 'chain-mock-document-1',
    data_hash: '0xmockdatahash',
    transacttion_link: 'https://example.test/mock-transaction',
  },
];

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json() as Promise<T>;
}

export default function BlockchainRecordsPage() {
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => getJson<UserProfile | null>('/users/'),
  });
  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (getPortalUiRole(profileQuery.data?.role) !== 'issuer') {
    return <p className="text-sm font-semibold text-[#64748b]">Blockchain records are available to Document Issuers only.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Blockchain Records</h1>
        <p className="mt-1 text-sm text-[#64748b]">Local mock blockchain records for the Document Issuer workspace.</p>
      </header>
      <p className="rounded-[18px] border border-[#E8F0F8] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>
      {mockBlockchainRecords.length === 0 ? (
        <p className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 text-sm font-semibold text-[#64748b]">No anchored record</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mockBlockchainRecords.map((record) => <BlockchainRecordCard key={record.document_id} record={record} />)}
        </div>
      )}
    </div>
  );
}
