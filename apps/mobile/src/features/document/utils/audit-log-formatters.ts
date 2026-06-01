import type { AuditLogResponse } from '@/services/api';

export const formatAuditAction = (action: string) =>
  action
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatAuditTime = (value: string) => {
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
};

export const formatAuditDetails = (details: AuditLogResponse['details']) => {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  return Object.entries(details)
    .map(([key, value]) => `${formatAuditAction(key)}: ${String(value)}`)
    .join(' • ');
};

export const sortAuditLogsNewestFirst = (logs: AuditLogResponse[]) =>
  [...logs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
