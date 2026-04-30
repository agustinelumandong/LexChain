import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surfaceSoft: '#F7FBFF',
  successSoft: '#EAF8F0',
};

type IntegrityCheckCardProps = {
  offChainHash: string;
  onChainHash: string;
  status: string;
  onPressViewAnchor?: () => void;
};

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
        <Text style={styles.rowValue}>{offChainHash}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>On-chain hash</Text>
        <Text style={styles.rowValue}>{onChainHash}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{status}</Text>
      </View>

      <Button
        label="View anchor tx"
        variant="secondary"
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  rowValue: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusValue: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
