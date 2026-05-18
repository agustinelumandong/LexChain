import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentPdfToolsSheetColors = {
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  primary: APP_COLORS.primary,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
};

export const documentPdfToolsSheetStyles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: documentPdfToolsSheetColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: documentPdfToolsSheetColors.borderSoft,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: documentPdfToolsSheetColors.borderSoft,
  },
  sheetIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: documentPdfToolsSheetColors.surfaceSoft,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    color: documentPdfToolsSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  sheetSubtitle: {
    color: documentPdfToolsSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  metadataText: {
    color: documentPdfToolsSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    color: documentPdfToolsSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    backgroundColor: documentPdfToolsSheetColors.surfaceSoft,
  },
  reference: {
    color: documentPdfToolsSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
