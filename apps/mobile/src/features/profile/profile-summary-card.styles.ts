import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const profileSummaryCardColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  borderSoft: APP_COLORS.borderSoft,
};

export const profileSummaryCardStyles = StyleSheet.create({
  card: {
    backgroundColor: profileSummaryCardColors.surface,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: profileSummaryCardColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: profileSummaryCardColors.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: profileSummaryCardColors.navy,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  role: {
    color: profileSummaryCardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: profileSummaryCardColors.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: profileSummaryCardColors.surfaceSoft,
    borderWidth: 1,
    borderColor: profileSummaryCardColors.borderSoft,
  },
  statusChipText: {
    color: profileSummaryCardColors.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
