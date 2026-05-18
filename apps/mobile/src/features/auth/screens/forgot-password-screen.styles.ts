import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  surfaceSoft: APP_COLORS.bg,
  success: APP_COLORS.success,
  successSoft: '#E9FFF1',
  textMuted: APP_COLORS.textMuted,
};

export const forgotPasswordScreenStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  fieldStack: {
    gap: 10,
  },
  notice: {
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.successSoft,
  },
  noticeTitle: {
    color: COLORS.success,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  noticeBody: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  noticeMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  actions: {
    gap: 12,
  },
  supportText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
