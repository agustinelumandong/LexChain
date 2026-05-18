import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const screenHeaderColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  white: APP_COLORS.white,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  darkTextMuted: '#B8CCE8',
  darkAction: 'rgba(255,255,255,0.10)',
};

export const screenHeaderStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  glass: {
    overflow: 'hidden',
    borderBottomWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightActionButton: {
    backgroundColor: screenHeaderColors.surface,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  darkActionButton: {
    backgroundColor: screenHeaderColors.darkAction,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  actionSpacer: {
    width: 32,
    height: 32,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: screenHeaderColors.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: screenHeaderColors.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },
  darkTitle: {
    color: screenHeaderColors.white,
  },
  subtitle: {
    color: screenHeaderColors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  darkSubtitle: {
    color: screenHeaderColors.darkTextMuted,
  },
});
