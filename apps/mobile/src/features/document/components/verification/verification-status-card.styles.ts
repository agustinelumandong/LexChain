import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const verificationStatusCardColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
  success: APP_COLORS.primary,
};

export const verificationStatusCardStyles = StyleSheet.create({
  card: {
    backgroundColor: verificationStatusCardColors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    color: verificationStatusCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  stepsWrap: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepLead: {
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: verificationStatusCardColors.borderSoft,
  },
  dotDone: {
    backgroundColor: verificationStatusCardColors.success,
  },
  dotVerifying: {
    backgroundColor: verificationStatusCardColors.primary,
  },
  line: {
    width: 1,
    flex: 1,
    minHeight: 28,
    marginTop: 4,
    backgroundColor: verificationStatusCardColors.borderSoft,
  },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
  },
  stepLabel: {
    flex: 1,
    color: verificationStatusCardColors.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  stepStatus: {
    color: verificationStatusCardColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  stepStatusDone: {
    color: verificationStatusCardColors.primary,
  },
  stepStatusVerifying: {
    color: verificationStatusCardColors.primary,
  },
});
