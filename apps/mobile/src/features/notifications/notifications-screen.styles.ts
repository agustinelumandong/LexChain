import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const notificationScreenColors = {
  bg: APP_COLORS.bg,
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  primary: APP_COLORS.primary,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
  warning: APP_COLORS.warning,
};

export const notificationScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: notificationScreenColors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: notificationScreenColors.borderSoft,
    backgroundColor: notificationScreenColors.surface,
    padding: 16,
    gap: 12,
  },
  summaryTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTitle: {
    flex: 1,
    color: notificationScreenColors.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  summaryText: {
    color: notificationScreenColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: notificationScreenColors.primary,
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: notificationScreenColors.surface,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  markAllButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: notificationScreenColors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllButtonPressed: {
    opacity: 0.75,
  },
  markAllText: {
    color: notificationScreenColors.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  list: {
    gap: 10,
  },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: notificationScreenColors.borderSoft,
    backgroundColor: notificationScreenColors.surface,
    padding: 14,
    gap: 9,
  },
  rowUnread: {
    borderColor: notificationScreenColors.primary,
    backgroundColor: '#F4F9FF',
  },
  rowPressed: {
    opacity: 0.82,
  },
  rowTopLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: notificationScreenColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  body: {
    color: notificationScreenColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: notificationScreenColors.surfaceSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: notificationScreenColors.primary,
    fontFamily: fonts.regular,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  time: {
    flex: 1,
    color: notificationScreenColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: notificationScreenColors.primary,
    marginTop: 4,
  },
});
