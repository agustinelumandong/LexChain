import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const uploadTypeBottomSheetColors = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  primary: APP_COLORS.primary,
  primarySoft: APP_COLORS.surfaceSoft,
};

export const uploadTypeBottomSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: uploadTypeBottomSheetColors.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: uploadTypeBottomSheetColors.sheet,
    borderWidth: 1,
    borderColor: uploadTypeBottomSheetColors.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: uploadTypeBottomSheetColors.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    gap: 10,
  },
  eyebrow: {
    color: uploadTypeBottomSheetColors.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: uploadTypeBottomSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
  },
  description: {
    color: uploadTypeBottomSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 62,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: uploadTypeBottomSheetColors.borderSoft,
    backgroundColor: uploadTypeBottomSheetColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionSelected: {
    borderColor: uploadTypeBottomSheetColors.primary,
    backgroundColor: uploadTypeBottomSheetColors.primarySoft,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: uploadTypeBottomSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  optionLabelSelected: {
    color: uploadTypeBottomSheetColors.primary,
  },
  optionHint: {
    color: uploadTypeBottomSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
