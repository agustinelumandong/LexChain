'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { BlockchainRecordCard } from '../components/blockchain-record-card';
import { getPortalUiRole } from '../lib/portal-role';
import type { DocumentListItem } from '../lib/document-library';

type UserProfile = ApiSchema<'UserProfileResponse'>;

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
  const documentsQuery = useQuery({
    queryKey: ['portal-documents'],
    queryFn: () => getJson<DocumentListItem[]>('/documents/'),
    enabled: getPortalUiRole(profileQuery.data?.role) === 'issuer',
  });

  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (getPortalUiRole(profileQuery.data?.role) !== 'issuer') {
    return <p className="text-sm font-semibold text-[#64748b]">Blockchain records are available to Document Issuers only.</p>;
  }

  if (documentsQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (documentsQuery.isError) {
    return <p role="alert" className="text-sm font-semibold text-[#64748b]">Unable to load blockchain records.</p>;
  }

  const documentIds = (documentsQuery.data ?? []).map((document) => document.id).filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Blockchain Records</h1>
        <p className="mt-1 text-sm text-[#64748b]">Read-only records returned by the blockchain service.</p>
      </header>
      {documentIds.length === 0 ? (
        <p className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 text-sm font-semibold text-[#64748b]">No anchored record</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {documentIds.map((documentId) => <BlockchainRecordCard key={documentId} documentId={documentId} />)}
        </div>
      )}
    </div>
  );
}
