import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const signInScreenStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  fieldStack: {
    gap: 10,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
  },
  chipActive: {
    backgroundColor: '#E3F1FF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: APP_COLORS.primary,
  },
  chipText: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
  forgotText: {
    color: APP_COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  actions: {
    gap: 12,
  },
});
