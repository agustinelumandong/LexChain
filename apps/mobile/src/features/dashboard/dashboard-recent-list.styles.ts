import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const dashboardRecentListColors = {
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  surfaceSuccess: '#EAF8F0',
  surfaceWarning: '#FFF4DD',
  surfaceError: '#FEE2E2',
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  warning: '#D28B00',
  success: '#16A34A',
  error: '#DC2626',
};

export const dashboardRecentListStyles = StyleSheet.create({
  group: {
    gap: 12,
  },
  heading: {
    color: dashboardRecentListColors.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  row: {
    backgroundColor: dashboardRecentListColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: dashboardRecentListColors.surfaceSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: dashboardRecentListColors.navy,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  subtitle: {
    color: dashboardRecentListColors.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeSuccess: {
    backgroundColor: dashboardRecentListColors.surfaceSuccess,
  },
  badgeWarning: {
    backgroundColor: dashboardRecentListColors.surfaceWarning,
  },
  badgeError: {
    backgroundColor: dashboardRecentListColors.surfaceError,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: fonts.regular,
    textTransform: 'capitalize',
  },
  badgeLabelSuccess: {
    color: dashboardRecentListColors.success,
  },
  badgeLabelWarning: {
    color: dashboardRecentListColors.warning,
  },
  badgeLabelError: {
    color: dashboardRecentListColors.error,
  },
  emptyState: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: dashboardRecentListColors.surface,
    borderWidth: 1,
    borderColor: dashboardRecentListColors.surfaceSoft,
    gap: 6,
  },
  emptyTitle: {
    color: dashboardRecentListColors.navy,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  emptyBody: {
    color: dashboardRecentListColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
});
