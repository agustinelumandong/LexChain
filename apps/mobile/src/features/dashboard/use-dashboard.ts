import { useMemo } from 'react';

import type { DocumentListItem, InvitationResponse } from '@/services/api';
import { useAdminInvitationsApi, useDocuments } from '@/services/query';

export type DashboardRecentActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  timestamp: string;
  status: string;
  tone: 'success' | 'warning' | 'info';
};

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

function getInvitationActivity(invitation: InvitationResponse): DashboardRecentActivity {
  const normalizedStatus = invitation.status.toLowerCase();
  const isAccepted = normalizedStatus === 'accepted';
  const isPending = normalizedStatus === 'pending';

  return {
    id: `invitation-${invitation.id}`,
    title: `${invitation.email} ${isAccepted ? 'accepted invite' : 'invite updated'}`,
    detail: `${invitation.role} invitation is ${invitation.status}.`,
    time: formatActivityTime(invitation.created_at),
    timestamp: invitation.created_at,
    status: isAccepted ? 'Accepted' : isPending ? 'Pending' : invitation.status,
    tone: isAccepted ? 'info' : isPending ? 'warning' : 'success',
  };
}

export function useDashboard() {
  const documentsQuery = useDocuments();
  const invitationsQuery = useAdminInvitationsApi();

  return useMemo(() => {
    const documents = documentsQuery.data ?? [];
    const invitations = invitationsQuery.data?.invitations ?? [];
    const documentsCount = documents.length;
    const anchoredOnChainCount = documents.filter(
      (doc) => doc.status === 'COMPLETED',
    ).length;
    const processingCount = documents.filter(
      (doc) => doc.status === 'PROCESSING' || doc.status === 'QUEUED',
    ).length;
    const pendingInvitationCount = invitations.filter(
      (invitation) => invitation.status.toLowerCase() === 'pending',
    ).length;
    const recentActivities = [
      ...documents.map(getDocumentActivity),
      ...invitations.map(getInvitationActivity),
    ]
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
      .slice(0, 3);

    return {
      documentsCount,
      anchoredOnChainCount,
      processingCount,
      pendingSharedDocumentsCount: pendingInvitationCount,
      recentActivities,
      isLoading: documentsQuery.isLoading || invitationsQuery.isLoading,
    };
  }, [
    documentsQuery.data,
    documentsQuery.isLoading,
    invitationsQuery.data,
    invitationsQuery.isLoading,
  ]);
}
