import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentSummaryCardColors = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
};

export const documentSummaryCardStyles = StyleSheet.create({
  card: {
    backgroundColor: documentSummaryCardColors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 13,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: documentSummaryCardColors.navy,
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
    color: documentSummaryCardColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  rowValue: {
    flexShrink: 1,
    color: documentSummaryCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: APP_COLORS.borderSoft,
    marginTop: 4,
  },
  summaryWrap: {
    gap: 8,
  },
  summaryLabel: {
    color: documentSummaryCardColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  summaryBody: {
    color: documentSummaryCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
