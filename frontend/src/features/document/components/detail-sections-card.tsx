import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surfaceSoft: APP_COLORS.white,
  successSoft: '#EAF8F0',
  borderSoft: APP_COLORS.borderSoft,
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
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  riskHelperText?: string;
};

const GROUP_ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  Organizations: 'account-balance',
  People: 'person',
  Dates: 'calendar-today',
  Links: 'link',
  'Document numbers': 'tag',
  Locations: 'location-on',
};

export function DetailSectionsCard({
  sections,
  confidenceLabel,
  confidenceValue,
  iconName,
  riskHelperText,
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
              <View style={styles.titleRow}>
                {iconName ? (
                  <View style={styles.iconBubble}>
                    <MaterialIcons name={iconName} size={22} color={COLORS.primary} />
                  </View>
                ) : null}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
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
                    <View
                      key={`${block.kind}-${index}`}
                      style={[styles.riskBlock, iconName && styles.riskBlockWithIcon]}
                    >
                      {block.severity && block !== firstRiskBlock ? (
                        <Text style={styles.riskPill}>{block.severity}</Text>
                      ) : null}
                      <Text style={styles.sectionBody}>{block.text}</Text>
                      {riskHelperText ? (
                        <View style={styles.riskHelperRow}>
                          <MaterialIcons name="info-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.riskHelperText}>{riskHelperText}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View key={`${block.kind}-${block.title}`} style={styles.groupBlock}>
                      <View style={styles.groupTitleRow}>
                        <MaterialIcons
                          name={GROUP_ICONS[block.title] ?? 'label'}
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.groupTitle}>{block.title}</Text>
                      </View>
                      <View style={styles.chipWrap}>
                        {block.values.map((value) => (
                          <Text key={value} style={styles.valueChip}>{value}</Text>
                        ))}
                      </View>
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
    padding: 20,
    gap: 18,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 0,
  },
  groupBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSoft,
  },
  groupTitleRow: {
    width: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  groupTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  chipWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueChip: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: APP_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  riskBlock: {
    alignItems: 'flex-start',
    gap: 14,
  },
  riskBlockWithIcon: {
    paddingLeft: 56,
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
  riskHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskHelperText: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
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
