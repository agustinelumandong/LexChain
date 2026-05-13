import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import { VerificationStatusBadge } from './VerificationStatusBadge';
import type { PublicVerificationResult } from '../types';

type VerificationResultCardProps = {
  result: PublicVerificationResult;
};

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

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

function formatHash(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  if (value.length <= 28) {
    return value;
  }

  return `${value.slice(0, 14)}...${value.slice(-12)}`;
}

export function VerificationResultCard({ result }: VerificationResultCardProps) {
  const rows = [
    { label: 'File name', value: result.file_name },
    { label: 'Verification code', value: result.verification_code },
    { label: 'Document hash', value: formatHash(result.document_hash) },
    { label: 'Uploaded', value: formatDate(result.uploaded_at) },
    { label: 'Verified', value: formatDate(result.verified_at) },
    { label: 'Owner', value: result.owner_display_name ?? 'Not available' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>LexChain Verification</Text>
          <Text style={styles.title}>{result.file_name}</Text>
        </View>
        <VerificationStatusBadge status={result.status} />
      </View>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {result.message ? (
        <View style={styles.messageBox}>
          <Text style={styles.message}>{result.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 24,
    gap: 22,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  titleBlock: {
    flex: 1,
    minWidth: 220,
    gap: 6,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  rows: {
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.borderSoft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.borderSoft,
    paddingVertical: 14,
  },
  rowLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  rowValue: {
    flex: 1,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  messageBox: {
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceSoft,
    padding: 14,
  },
  message: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
