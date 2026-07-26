'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { BlockchainRecordCard } from '../components/blockchain-record-card';
import { portalFetch } from '../lib/portal-fetch';
import { getPortalUiRole } from '../lib/portal-role';
import type { BlockchainRecordUi } from '../lib/blockchain-record-ui';

type UserProfile = ApiSchema<'UserProfileResponse'>;
type PortalDocument = Pick<ApiSchema<'DocumentResponse'>, 'document_id' | 'on_chain'>;

async function loadBlockchainRecords(): Promise<BlockchainRecordUi[]> {
  const documents = await portalFetch<PortalDocument[]>('/documents/');
  return Promise.all(
    documents
      .filter((document) => document.on_chain)
      .map((document) => portalFetch<BlockchainRecordUi>(`/blockchain/verify/${document.document_id}`)),
  );
}

export default function BlockchainRecordsPage() {
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => portalFetch<UserProfile | null>('/users/'),
  });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === 'issuer';
  const recordsQuery = useQuery<BlockchainRecordUi[]>({
    queryKey: ['portal-blockchain-records'],
    queryFn: loadBlockchainRecords,
    enabled: isIssuer,
  });
  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (!isIssuer) {
    return <p className="text-sm font-semibold text-[#64748b]">Blockchain records are available to Document Issuers only.</p>;
  }

  if (recordsQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  const records = recordsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Blockchain Records</h1>
        <p className="mt-1 text-sm text-[#64748b]">Local mock blockchain records for the Document Issuer workspace.</p>
      </header>
      <p className="self-start rounded-full border border-[#E8F0F8] bg-[#F8FBFF] px-3 py-1 text-xs font-bold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>
      {recordsQuery.isError ? (
        <p role="alert" className="rounded-[18px] border border-[#F5C6C6] bg-[#FFF7F7] p-5 text-sm font-semibold text-[#9B2C2C]">
          We could not load blockchain verification records.
        </p>
      ) : records.length === 0 ? (
        <p className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 text-sm font-semibold text-[#64748b]">No anchored records are available in this demo.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((record) => <BlockchainRecordCard key={record.document_id} record={record} />)}
        </div>
      )}
    </div>
  );
}
