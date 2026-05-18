import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const searchDocumentSheetColors = {
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
};

export const searchDocumentSheetStyles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: searchDocumentSheetColors.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: searchDocumentSheetColors.borderSoft,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: searchDocumentSheetColors.sheet,
    borderBottomWidth: 1,
    borderBottomColor: searchDocumentSheetColors.borderSoft,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: searchDocumentSheetColors.surface,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: searchDocumentSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: searchDocumentSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 16,
  },
  emptyCard: {
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: searchDocumentSheetColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: searchDocumentSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: searchDocumentSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
  },
});
