import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const invitationScreenColors = {
  bg: APP_COLORS.bg,
  borderSoft: APP_COLORS.borderSoft,
  danger: APP_COLORS.danger,
  navy: APP_COLORS.navy,
  primary: APP_COLORS.primary,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
};

export const invitationScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: invitationScreenColors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: invitationScreenColors.borderSoft,
    backgroundColor: invitationScreenColors.surface,
    padding: 14,
    gap: 9,
  },
  cardPressed: {
    opacity: 0.82,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: invitationScreenColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  body: {
    color: invitationScreenColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  rolePill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: invitationScreenColors.surfaceSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: invitationScreenColors.primary,
    fontFamily: fonts.regular,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  acceptButton: {
    borderColor: invitationScreenColors.primary,
    backgroundColor: invitationScreenColors.primary,
  },
  rejectButton: {
    borderColor: invitationScreenColors.borderSoft,
    backgroundColor: invitationScreenColors.surface,
  },
  disabledButton: {
    opacity: 0.55,
  },
  actionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  acceptText: {
    color: invitationScreenColors.surface,
  },
  rejectText: {
    color: invitationScreenColors.navy,
  },
});
