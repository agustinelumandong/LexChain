'use client';

import { use } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@/shared/types/index';
import { DocumentParticipantManagement } from '@/features/documents/components/document-participant-management';
import { portalFetch } from '@/shared/api/client';
import { ParticipantsSkeleton } from '@/features/documents/components/document-loading-skeletons';

type DocumentResponse = ApiSchema<'DocumentResponse'>;

export default function DocumentParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const documentQuery = useQuery<DocumentResponse>({
    queryKey: ['portal-doc', id],
    queryFn: () => portalFetch<DocumentResponse>(`/documents/${id}`),
    retry: false,
    refetchInterval: 10_000,
  });
  const canShare = documentQuery.data?.permissions?.can_share === true;
  const canRevoke = documentQuery.data?.permissions?.can_revoke === true;

  if (documentQuery.isPending) {
    return <ParticipantsSkeleton label="Loading participant permissions" />;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <div>
        <Link
          href={`/portal/documents/${id}?tab=participants`}
          className="flex w-fit items-center gap-1.5 text-sm font-bold text-[#0067B3]"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to document
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.5px] text-[#0067B3]">Document access</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#0C2B49]">Participant management</h1>
        <p className="mt-1 text-sm font-medium text-[#5B6F8A]">
          Invite and revoke access for this document. This does not manage user roles, office access, or categories.
        </p>
      </div>
      <DocumentParticipantManagement
        documentId={id}
        canShare={canShare}
        canRevoke={canRevoke}
        documentError={documentQuery.isError}
      />
    </div>
  );
}
