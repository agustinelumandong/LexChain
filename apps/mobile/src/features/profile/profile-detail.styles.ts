import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const profileDetailColors = {
  bg: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: '#F7FBFF',
  borderSoft: APP_COLORS.borderSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

export const profileDetailStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: profileDetailColors.bg,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  contentWithFooter: {
    paddingBottom: 112,
  },
  fieldStack: {
    gap: 12,
  },
  card: {
    backgroundColor: profileDetailColors.surface,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: profileDetailColors.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  cardDescription: {
    color: profileDetailColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    color: profileDetailColors.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  fieldInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: profileDetailColors.borderSoft,
    backgroundColor: profileDetailColors.surfaceSoft,
    paddingHorizontal: 14,
    color: profileDetailColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
  },
  mfaReadOnlyInput: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 2,
  },
  toggleLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: profileDetailColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: profileDetailColors.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  rowDescription: {
    color: profileDetailColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#DDE7F2',
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: profileDetailColors.primary,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: profileDetailColors.surface,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCopy: {
    flex: 1,
    gap: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: profileDetailColors.bg,
    borderTopWidth: 1,
    borderTopColor: profileDetailColors.borderSoft,
  },
});
