import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surfaceSoft: '#F7FBFF',
  successSoft: '#EAF8F0',
};

type DetailRow = {
  label: string;
  value: string;
};

type DetailSection =
  | {
      title: string;
      body: string;
      rows?: never;
    }
  | {
      title: string;
      rows: DetailRow[];
      body?: never;
    };

type DetailSectionsCardProps = {
  sections: DetailSection[];
  confidenceLabel: string;
  confidenceValue: string;
};

export function DetailSectionsCard({
  sections,
  confidenceLabel,
  confidenceValue,
}: DetailSectionsCardProps) {
  return (
    <View style={styles.card}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {'body' in section ? (
            <Text style={styles.sectionBody}>{section.body}</Text>
          ) : (
            <View style={styles.rowsWrap}>
              {section.rows.map((row) => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.confidenceCard}>
        <Text style={styles.confidenceLabel}>{confidenceLabel}</Text>
        <Text style={styles.confidenceValue}>{confidenceValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 24,
    padding: 18,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  sectionBody: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  rowsWrap: {
    gap: 8,
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
  confidenceCard: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  confidenceValue: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
