import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import type { ButtonSize, ButtonVariant } from './button.types';

export const buttonColors = {
  primary: APP_COLORS.primary,
  primaryPressed: '#0E73D8',
  navy: APP_COLORS.navy,
  white: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  borderSoft: APP_COLORS.borderSoft,
  lightSurface: 'rgba(255,255,255,0.14)',
  lightSurfacePressed: 'rgba(255,255,255,0.22)',
  lightBorder: 'rgba(255,255,255,0.24)',
  lightTextMuted: 'rgba(255,255,255,0.72)',
  disabledBg: '#DCE9F8',
  disabledText: '#7F9EC2',
};

type ButtonVariantConfig = {
  container: StyleProp<ViewStyle>;
  pressed: StyleProp<ViewStyle>;
  disabledContainer?: StyleProp<ViewStyle>;
};

export const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  fullWidth: {
    width: '100%',
  },
  hugWidth: {
    alignSelf: 'center',
  },
  fullRound: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledPrimary: {
    backgroundColor: buttonColors.disabledBg,
    boxShadow: 'none',
    elevation: 0,
  },
  disabledSecondary: {
    backgroundColor: '#F1F7FF',
  },
  disabledGhost: {
    backgroundColor: 'transparent',
  },
  disabledLight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  image: {
    flexShrink: 0,
  },
  label: {
    fontFamily: fonts.regular,
    fontWeight: '700',
    textAlign: 'center',
  },
});

const buttonVariantStyles = StyleSheet.create({
  primaryContainer: {
    backgroundColor: buttonColors.primary,
    boxShadow: `0px 10px 15px rgba(22, 137, 245, 0.14)`,
    elevation: 4,
  },
  primaryPressed: {
    backgroundColor: buttonColors.primaryPressed,
  },
  secondaryContainer: {
    backgroundColor: buttonColors.surfaceSoft,
  },
  secondaryPressed: {
    backgroundColor: buttonColors.borderSoft,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(22, 137, 245, 0.08)',
  },
  lightContainer: {
    backgroundColor: buttonColors.lightSurface,
    borderWidth: 1,
    borderColor: buttonColors.lightBorder,
  },
  lightPressed: {
    backgroundColor: buttonColors.lightSurfacePressed,
  },
});

export const labelStyles = StyleSheet.create({
  primary: {
    color: buttonColors.white,
  },
  secondary: {
    color: buttonColors.navy,
  },
  ghost: {
    color: buttonColors.navy,
  },
  light: {
    color: buttonColors.white,
  },
});

export const disabledLabelStyles = StyleSheet.create({
  primary: {
    color: buttonColors.disabledText,
  },
  secondary: {
    color: buttonColors.disabledText,
  },
  ghost: {
    color: buttonColors.disabledText,
  },
  light: {
    color: buttonColors.lightTextMuted,
  },
});

export const labelSizeStyles = StyleSheet.create({
  sm: {
    fontSize: 12,
    lineHeight: 16,
  },
  md: {
    fontSize: 14,
    lineHeight: 18,
  },
  lg: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export const variantStyles = {
  primary: {
    container: buttonVariantStyles.primaryContainer,
    pressed: buttonVariantStyles.primaryPressed,
    disabledContainer: buttonStyles.disabledPrimary,
  },
  secondary: {
    container: buttonVariantStyles.secondaryContainer,
    pressed: buttonVariantStyles.secondaryPressed,
    disabledContainer: buttonStyles.disabledSecondary,
  },
  ghost: {
    container: buttonVariantStyles.ghostContainer,
    pressed: buttonVariantStyles.ghostPressed,
    disabledContainer: buttonStyles.disabledGhost,
  },
  light: {
    container: buttonVariantStyles.lightContainer,
    pressed: buttonVariantStyles.lightPressed,
    disabledContainer: buttonStyles.disabledLight,
  },
} satisfies Record<ButtonVariant, ButtonVariantConfig>;

export const variantIconColor: Record<ButtonVariant, string> = {
  primary: buttonColors.white,
  secondary: buttonColors.navy,
  ghost: buttonColors.navy,
  light: buttonColors.white,
};

export const disabledIconColor: Record<ButtonVariant, string> = {
  primary: buttonColors.disabledText,
  secondary: buttonColors.disabledText,
  ghost: buttonColors.disabledText,
  light: buttonColors.lightTextMuted,
};

export const iconSizeStyles: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

export const imageSizeStyles = StyleSheet.create({
  sm: {
    width: 16,
    height: 16,
  },
  md: {
    width: 20,
    height: 20,
  },
  lg: {
    width: 24,
    height: 24,
  },
});
