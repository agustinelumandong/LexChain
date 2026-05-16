import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import type { PublicVerificationStatus } from '../types';

type VerificationStatusBadgeProps = {
  status: PublicVerificationStatus;
};

const STATUS_META: Record<
  PublicVerificationStatus,
  { label: string; backgroundColor: string; color: string }
> = {
  verified: {
    label: 'Verified',
    backgroundColor: '#E7F8EF',
    color: APP_COLORS.success,
  },
  invalid: {
    label: 'Invalid',
    backgroundColor: '#FDECEF',
    color: APP_COLORS.danger,
  },
  expired: {
    label: 'Expired',
    backgroundColor: '#FFF4D9',
    color: APP_COLORS.warning,
  },
  revoked: {
    label: 'Revoked',
    backgroundColor: '#FDECEF',
    color: APP_COLORS.danger,
  },
  pending: {
    label: 'Pending',
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
  },
};

export function VerificationStatusBadge({ status }: VerificationStatusBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.badge, { backgroundColor: meta.backgroundColor }]}>
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
