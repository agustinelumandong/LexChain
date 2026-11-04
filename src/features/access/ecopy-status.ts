export function formatEcopyRequestStatus(status: string): string {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'APPROVED') return 'Approved';
  if (normalized === 'DECLINED') return 'Declined';
  if (normalized === 'PENDING') return 'Pending';
  return status;
}

export function formatEcopyDeliveryStatus(status: string): string {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'SENT') return 'Sent';
  if (normalized === 'FAILED') return 'Failed';
  if (normalized === 'SENDING') return 'Sending';
  if (normalized === 'PENDING') return 'Pending';
  return status;
}
