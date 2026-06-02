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
  tone: 'success' | 'warning' | 'info' | 'danger';
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

function formatStatusLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getDocumentActivity(document: DocumentListItem): DashboardRecentActivity {
  const status = document.status.toUpperCase();

  if (document.on_chain) {
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

  if (status === 'COMPLETED') {
    return {
      id: `document-${document.id}`,
      title: `${document.file_name} is ready`,
      detail: 'Document processing finished. Blockchain anchoring is not complete yet.',
      time: formatActivityTime(document.created_at),
      timestamp: document.created_at,
      status: 'Completed',
      tone: 'info',
    };
  }

  if (status === 'PROCESSING') {
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

  if (status === 'QUEUED' || status === 'PENDING') {
    return {
      id: `document-${document.id}`,
      title: `${document.file_name} is queued`,
      detail: 'Document is waiting for processing.',
      time: formatActivityTime(document.created_at),
      timestamp: document.created_at,
      status: 'Queued',
      tone: 'warning',
    };
  }

  if (status === 'FAILED') {
    return {
      id: `document-${document.id}`,
      title: `${document.file_name} failed processing`,
      detail: 'Document processing did not complete successfully.',
      time: formatActivityTime(document.created_at),
      timestamp: document.created_at,
      status: 'Failed',
      tone: 'danger',
    };
  }

  return {
    id: `document-${document.id}`,
    title: `${document.file_name} status changed`,
    detail: 'Document status was updated.',
    time: formatActivityTime(document.created_at),
    timestamp: document.created_at,
    status: formatStatusLabel(status),
    tone: 'info',
  };
}

export function useDashboard() {
  const documentsQuery = useDocuments();
  const { refetch: refetchDocuments } = documentsQuery;
  const refetch = useCallback(async () => {
    await refetchDocuments();
  }, [refetchDocuments]);

  return useMemo(() => {
    const documents = documentsQuery.data ?? [];
    const documentsCount = documents.length;
    const anchoredOnChainCount = documents.filter((doc) => doc.on_chain).length;
    const processingCount = documents.filter(
      (doc) => doc.status === 'PROCESSING' || doc.status === 'QUEUED',
    ).length;
    const recentActivities = documents
      .map(getDocumentActivity)
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
      .slice(0, 5);

    return {
      documentsCount,
      anchoredOnChainCount,
      pendingParticipantInvitesCount: 0,
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
    refetch,
  ]);
}
