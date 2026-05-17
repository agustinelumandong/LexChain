import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const updateDocumentSheetStyles = StyleSheet.create({
  menuRowPressed: {
    opacity: 0.72,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: APP_COLORS.bg,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  handleIndicator: {
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: APP_COLORS.borderSoft,
  },
  updateSheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 18,
  },
  sheetHeader: {
    gap: 8,
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  filePickerCard: {
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  filePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  filePickerDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  uploadProgressCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  uploadProgressLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  uploadProgressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.borderSoft,
  },
  uploadProgressFill: {
    width: '42%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
  },
});
