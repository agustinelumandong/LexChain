import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surfaceSoft: '#F7FBFF',
  successSoft: '#EAF8F0',
};

type DetailRow = {
  label: string;
  value: string;
};

type DetailBodyBlock =
  | {
      kind: 'group';
      title: string;
      values: string[];
    }
  | {
      kind: 'risk';
      severity?: string;
      text: string;
    };

type DetailRiskBlock = Extract<DetailBodyBlock, { kind: 'risk' }>;

type DetailSection =
  | {
      title: string;
      body: string;
      bodyBlocks?: never;
      rows?: never;
    }
  | {
      title: string;
      bodyBlocks: DetailBodyBlock[];
      body?: never;
      rows?: never;
    }
  | {
      title: string;
      rows: DetailRow[];
      body?: never;
      bodyBlocks?: never;
    };

type DetailSectionsCardProps = {
  sections: DetailSection[];
  confidenceLabel?: string;
  confidenceValue?: string;
};

export function DetailSectionsCard({
  sections,
  confidenceLabel,
  confidenceValue,
}: DetailSectionsCardProps) {
  return (
    <View style={styles.card}>
      {sections.map((section) => {
        const firstRiskBlock = section.bodyBlocks?.find(
          (block): block is DetailRiskBlock => block.kind === 'risk' && Boolean(block.severity),
        );

        return (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {firstRiskBlock?.severity ? (
                <Text style={styles.riskPill}>{firstRiskBlock.severity}</Text>
              ) : null}
            </View>

            {'body' in section ? (
              <Text style={styles.sectionBody}>{section.body}</Text>
            ) : section.bodyBlocks ? (
              <View style={styles.blocksWrap}>
                {section.bodyBlocks.map((block, index) =>
                  block.kind === 'risk' ? (
                    <View key={`${block.kind}-${index}`} style={styles.riskBlock}>
                      {block.severity && block !== firstRiskBlock ? (
                        <Text style={styles.riskPill}>{block.severity}</Text>
                      ) : null}
                      <Text style={styles.sectionBody}>{block.text}</Text>
                    </View>
                  ) : (
                    <View key={`${block.kind}-${block.title}`} style={styles.groupBlock}>
                      <Text style={styles.groupTitle}>{block.title}</Text>
                      <Text style={styles.sectionBody}>{block.values.join('\n')}</Text>
                    </View>
                  ),
                )}
              </View>
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
        );
      })}

      {confidenceLabel && confidenceValue ? (
        <View style={styles.confidenceCard}>
          <Text style={styles.confidenceLabel}>{confidenceLabel}</Text>
          <Text style={styles.confidenceValue}>{confidenceValue}</Text>
        </View>
      ) : null}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  sectionBody: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  blocksWrap: {
    gap: 14,
  },
  groupBlock: {
    gap: 5,
  },
  groupTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  riskBlock: {
    alignItems: 'flex-start',
    gap: 8,
  },
  riskPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#FFF2D9',
    color: '#A15C00',
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  rowValue: {
    flexShrink: 1,
    color: COLORS.navy,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  confidenceValue: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
});
