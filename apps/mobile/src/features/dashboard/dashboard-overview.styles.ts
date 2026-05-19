import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const COLORS = {
  bg: APP_COLORS.bg,
  surface: APP_COLORS.white,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  success: APP_COLORS.success,
  warning: APP_COLORS.warning,
  info: APP_COLORS.primary,
  successSoft: '#EAF8F0',
  warningSoft: '#FFF4DD',
  infoSoft: '#EAF4FF',
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  headerBlock: {
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiItem: {
    flex: 1,
  },
  activityGroup: {
    gap: 12,
  },
  activityHeading: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  activityRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  activityCopy: {
    gap: 8,
    minWidth: 0,
  },
  activityTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityText: {
    color: COLORS.navy,
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
    minWidth: 0,
  },
  activityDetail: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  activityStatus: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingVertical: 5,
    paddingHorizontal: 9,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    fontFamily: fonts.regular,
    flexShrink: 0,
    maxWidth: 92,
  },
  activityStatusSuccess: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  activityStatusWarning: {
    backgroundColor: COLORS.warningSoft,
    color: '#B77900',
  },
  activityStatusInfo: {
    backgroundColor: COLORS.infoSoft,
    color: COLORS.info,
  },
  activityTime: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  searchGroup: {
    gap: 6,
  },
  sectionLabel: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  searchBar: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  searchBarPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
