import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
};

type SummaryRow = {
  label: string;
  value: string;
};

type DocumentSummaryCardProps = {
  title: string;
  rows: SummaryRow[];
  summary: string;
};

export function DocumentSummaryCard({
  title,
  rows,
  summary,
}: DocumentSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={styles.rowValue}>{row.value}</Text>
        </View>
      ))}

      <Text style={styles.summaryLabel}>Short summary</Text>
      <Text style={styles.summaryBody}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    shadowColor: '#133B73',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 18,
    lineHeight: 22,
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
    flexShrink: 1,
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  summaryBody: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
