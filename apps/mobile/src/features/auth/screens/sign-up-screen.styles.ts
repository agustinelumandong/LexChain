import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const signUpStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  fieldStack: {
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
  },
  chip: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
  },
  chipText: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
  actions: {
    gap: 12,
  },
  passwordStrengthCard: {
    gap: 8,
    paddingHorizontal: 4,
    marginTop: -2,
  },
  passwordStrengthLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  passwordStrengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  passwordStrengthMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  passwordStrengthHint: {
    flex: 1,
    color: APP_COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  termsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: APP_COLORS.bg,
  },
  termsPreviewText: {
    flex: 1,
    gap: 4,
  },
  termsPreviewTitle: {
    color: APP_COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  termsPreviewBody: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  termsPreviewAction: {
    color: APP_COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
