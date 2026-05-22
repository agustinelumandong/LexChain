import { useCallback, useMemo } from 'react';

import type { DocumentListItem } from '@/services/api';
import { useDocuments } from '@/services/query';

export type DashboardRecentActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  timestamp: string;
  status: string;
  tone: 'success' | 'warning' | 'info';
};

const MOCK_DOCUMENT_PARTICIPANT_INVITES = [
  {
    id: 'mock-participant-invite-1',
    documentTitle: 'Service Agreement.pdf',
    participantName: 'Maria Santos',
    invitedAt: '2026-05-22T08:30:00.000Z',
  },
  {
    id: 'mock-participant-invite-2',
    documentTitle: 'Lease Contract.pdf',
    participantName: 'Juan Dela Cruz',
    invitedAt: '2026-05-21T14:15:00.000Z',
  },
];

function formatActivityTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getDocumentActivity(document: DocumentListItem): DashboardRecentActivity {
  const status = document.status;

  if (status === 'COMPLETED') {
    return {
      id: `document-${document.id}`,
      title: `${document.file_name} was anchored`,
      detail: 'Blockchain record confirmed and ready for verification.',
      time: formatActivityTime(document.created_at),
      timestamp: document.created_at,
      status: 'Anchored',
      tone: 'success',
    };
  }

  if (status === 'PROCESSING' || status === 'QUEUED') {
    return {
      id: `document-${document.id}`,
      title: `${document.file_name} is still processing`,
      detail: 'Document analysis and hash preparation are still running.',
      time: formatActivityTime(document.created_at),
      timestamp: document.created_at,
      status: 'Processing',
      tone: 'warning',
    };
  }

  return {
    id: `document-${document.id}`,
    title: `${document.file_name} needs review`,
    detail: 'Document processing did not complete successfully.',
    time: formatActivityTime(document.created_at),
    timestamp: document.created_at,
    status: 'Review',
    tone: 'warning',
  };
}

type UseDashboardOptions = {
  includeMockParticipantInvites?: boolean;
};

export function useDashboard({
  includeMockParticipantInvites = false,
}: UseDashboardOptions = {}) {
  const documentsQuery = useDocuments();
  const refetch = useCallback(async () => {
    await documentsQuery.refetch();
  }, [documentsQuery]);

  return useMemo(() => {
    const documents = documentsQuery.data ?? [];
    const documentsCount = documents.length;
    const anchoredOnChainCount = documents.filter(
      (doc) => doc.status === 'COMPLETED',
    ).length;
    const processingCount = documents.filter(
      (doc) => doc.status === 'PROCESSING' || doc.status === 'QUEUED',
    ).length;
    const recentActivities = documents
      .map(getDocumentActivity)
      .concat(
        includeMockParticipantInvites
          ? MOCK_DOCUMENT_PARTICIPANT_INVITES.map((invite) => ({
              id: invite.id,
              title: `${invite.participantName} invited to participate`,
              detail: invite.documentTitle,
              time: formatActivityTime(invite.invitedAt),
              timestamp: invite.invitedAt,
              status: 'Invite',
              tone: 'info' as const,
            }))
          : [],
      )
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
      .slice(0, 3);

    return {
      documentsCount,
      anchoredOnChainCount,
      pendingParticipantInvitesCount: includeMockParticipantInvites
        ? MOCK_DOCUMENT_PARTICIPANT_INVITES.length
        : 0,
      processingCount,
      recentActivities,
      isLoading: documentsQuery.isLoading,
      isRefetching: documentsQuery.isRefetching,
      refetch,
    };
  }, [
    documentsQuery.data,
    documentsQuery.isLoading,
    documentsQuery.isRefetching,
    includeMockParticipantInvites,
    refetch,
  ]);
}
