import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const searchResultsCardColors = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  primary: APP_COLORS.primary,
};

export const searchResultsCardStyles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: searchResultsCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: `${searchResultsCardColors.primary}20`,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: searchResultsCardColors.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  results: {
    gap: 12,
  },
  hitRow: {
    borderRadius: 20,
    backgroundColor: searchResultsCardColors.surface,
    padding: 16,
    gap: 10,
    shadowColor: searchResultsCardColors.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  hitRowPressed: {
    opacity: 0.85,
  },
  hitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chunkIndex: {
    color: searchResultsCardColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  hitText: {
    color: searchResultsCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: searchResultsCardColors.surface,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: searchResultsCardColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
