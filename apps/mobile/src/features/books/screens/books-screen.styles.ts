import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const booksScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 112,
    gap: 12,
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 16,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.74,
  },
  cardTopLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
  cardMeta: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  statusPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillFull: {
    backgroundColor: '#FDECEC',
    color: '#B42318',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 12,
    gap: 4,
  },
  statValue: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(7, 22, 43, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: APP_COLORS.white,
  },
  handle: {
    backgroundColor: APP_COLORS.borderSoft,
  },
  sheetContent: {
    paddingHorizontal: 18,
    gap: 14,
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  sheetText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  inputStack: {
    gap: 8,
  },
  inputLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: '#F7FBFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
