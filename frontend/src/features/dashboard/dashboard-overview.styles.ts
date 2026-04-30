import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const COLORS = {
  bg: APP_COLORS.bg,
  surface: APP_COLORS.white,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
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
  headerBlock: {
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchGroup: {
    gap: 6,
  },
  sectionLabel: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  searchBar: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
