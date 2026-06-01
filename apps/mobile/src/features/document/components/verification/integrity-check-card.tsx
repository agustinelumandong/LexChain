import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui';

import { APP_COLORS, fonts } from '@/theme';
import { formatReference } from '../../utils/document-details-formatters';

const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surfaceSoft: '#F7FBFF',
  primarySoft: '#EAF4FF',
};

type IntegrityCheckCardProps = {
  offChainHash: string;
  onChainHash: string;
  status: string;
  onPressViewAnchor?: () => void;
};

function formatHashPreview(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === 'pending' || normalized === 'not anchored yet') {
    return value;
  }

  return formatReference(value);
}

export function IntegrityCheckCard({
  offChainHash,
  onChainHash,
  status,
  onPressViewAnchor,
}: IntegrityCheckCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Integrity check</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Off-chain hash</Text>
        <Text style={styles.rowValue} selectable>
          {formatHashPreview(offChainHash)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>On-chain hash</Text>
        <Text style={styles.rowValue} selectable>
          {formatHashPreview(onChainHash)}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{status}</Text>
      </View>

      <Button
        label="View anchor tx"
        variant="primary"
        fullWidth
        onPress={onPressViewAnchor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  rowValue: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusValue: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
