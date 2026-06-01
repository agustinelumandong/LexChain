import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const uploadBookSelectorStyles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
  },
  selector: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorPressed: {
    opacity: 0.74,
  },
  selectorDisabled: {
    opacity: 0.55,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  description: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
