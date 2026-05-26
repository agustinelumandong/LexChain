import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentActionsSheetColors = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  primary: APP_COLORS.primary,
};

export const documentActionsSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: documentActionsSheetColors.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: documentActionsSheetColors.sheet,
    borderWidth: 1,
    borderColor: documentActionsSheetColors.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: documentActionsSheetColors.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: documentActionsSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: documentActionsSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actionItem: {
    backgroundColor: documentActionsSheetColors.surface,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F7FBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionLabel: {
    color: documentActionsSheetColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  actionDescription: {
    color: documentActionsSheetColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
