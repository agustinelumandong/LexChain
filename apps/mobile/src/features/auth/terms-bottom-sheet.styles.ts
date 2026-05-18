import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const TERMS_BOTTOM_SHEET_COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  success: APP_COLORS.success,
};

const COLORS = TERMS_BOTTOM_SHEET_COLORS;

export const termsBottomSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerCopy: {
    flex: 1,
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
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    gap: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  sectionBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  reachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  reachedText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  reachedTextDone: {
    color: COLORS.success,
  },
  footer: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxRowDisabled: {
    opacity: 0.58,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxDisabled: {
    backgroundColor: '#F7FBFF',
  },
  checkboxLabel: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  checkboxLabelDisabled: {
    color: COLORS.textMuted,
  },
});
