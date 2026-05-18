export type DashboardRecentBadgeTone = 'success' | 'warning' | 'error';

export function formatDashboardRecentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDashboardRecentBadgeTone(status: string): DashboardRecentBadgeTone {
  const normalizedStatus = status.toLowerCase();
  if (
    normalizedStatus.includes('verified') ||
    normalizedStatus.includes('complete') ||
    normalizedStatus.includes('success')
  ) {
    return 'success';
  }
  if (normalizedStatus.includes('failed') || normalizedStatus.includes('error')) {
    return 'error';
  }
  return 'warning';
}
