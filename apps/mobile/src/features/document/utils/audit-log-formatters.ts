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

export const formatIdOrHash = (val: string): string => {
  if (typeof val !== 'string') return String(val);
  if (val.includes('@') || val.includes(' ')) return val;
  const isLongIdOrHash = /^[0-9a-zA-Z-_\.]+$/.test(val) && val.length >= 10;
  if (isLongIdOrHash) {
    if (val.startsWith('0x')) {
      return val.slice(0, 5) + '...' + val.slice(-3);
    }
    return val.slice(0, 3) + '...' + val.slice(-3);
  }
  return val;
};

export const formatAuditDetails = (details: AuditLogResponse['details']) => {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  return Object.entries(details)
    .map(([key, value]) => {
      const strValue = String(value);
      const formattedValue = formatIdOrHash(strValue);
      return `${formatAuditAction(key)}: ${formattedValue}`;
    })
    .join(' • ');
};

export const sortAuditLogsNewestFirst = (logs: AuditLogResponse[]) =>
  [...logs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
