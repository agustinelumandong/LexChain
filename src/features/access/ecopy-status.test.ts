import { describe, expect, it } from 'vitest';
import { formatEcopyDeliveryStatus, formatEcopyRequestStatus } from './ecopy-status';

describe('formatEcopyRequestStatus', () => {
  it('formats request statuses in sentence case', () => {
    expect(formatEcopyRequestStatus('APPROVED')).toBe('Approved');
    expect(formatEcopyRequestStatus('DECLINED')).toBe('Declined');
    expect(formatEcopyRequestStatus('PENDING')).toBe('Pending');
    expect(formatEcopyRequestStatus('pending')).toBe('Pending');
    expect(formatEcopyRequestStatus('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('formatEcopyDeliveryStatus', () => {
  it('formats delivery statuses in sentence case', () => {
    expect(formatEcopyDeliveryStatus('SENT')).toBe('Sent');
    expect(formatEcopyDeliveryStatus('FAILED')).toBe('Failed');
    expect(formatEcopyDeliveryStatus('SENDING')).toBe('Sending');
    expect(formatEcopyDeliveryStatus('PENDING')).toBe('Pending');
    expect(formatEcopyDeliveryStatus('failed')).toBe('Failed');
    expect(formatEcopyDeliveryStatus('UNKNOWN')).toBe('UNKNOWN');
  });
});
