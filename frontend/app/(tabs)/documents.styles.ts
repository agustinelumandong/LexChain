import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  bg: APP_COLORS.bg,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  searchWrap: {
    zIndex: 20,
  },
  resultRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  resultMeta: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  resultDate: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  emptyState: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'none',
  },
  emptyTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
