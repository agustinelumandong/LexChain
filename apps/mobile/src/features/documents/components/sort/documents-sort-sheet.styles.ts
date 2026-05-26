import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentsSortSheetColors = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
};

export const documentsSortSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: documentsSortSheetColors.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: documentsSortSheetColors.sheet,
    borderWidth: 1,
    borderColor: documentsSortSheetColors.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: documentsSortSheetColors.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarLabel: {
    color: documentsSortSheetColors.navy,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  headerBlock: {
    gap: 8,
  },
  eyebrow: {
    color: documentsSortSheetColors.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: documentsSortSheetColors.navy,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: documentsSortSheetColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: documentsSortSheetColors.borderSoft,
    backgroundColor: documentsSortSheetColors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionRowSelected: {
    backgroundColor: documentsSortSheetColors.surfaceSoft,
    borderColor: '#A8D1FF',
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: documentsSortSheetColors.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  optionLabelSelected: {
    color: documentsSortSheetColors.primary,
  },
  optionHelper: {
    color: documentsSortSheetColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: documentsSortSheetColors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
