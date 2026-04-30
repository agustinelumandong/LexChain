import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  style?: StyleProp<ViewStyle>;
};

const COLORS = {
  primary: '#1689F5',
  primaryPressed: '#0E73D8',
  navy: '#133B73',
  white: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  borderSoft: '#D7EBFF',
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

/**
 * Usage patterns:
 * - `primary`: main CTA on light surfaces
 * - `secondary`: secondary CTA on light surfaces
 * - `ghost`: low-emphasis action on light surfaces
 * - `light`: CTA on dark, gradient, or glass surfaces
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIconName,
  rightIconName,
  style,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        fullWidth && styles.fullWidth,
        variantStyles[variant].container,
        pressed && !isInactive && variantStyles[variant].pressed,
        isInactive && variantStyles[variant].disabledContainer,
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
          <ActivityIndicator
            size="small"
            color={isInactive ? disabledIconColor[variant] : variantIconColor[variant]}
           />
        ) : (
          <View style={styles.content}>
            {leftIconName ?
              <MaterialIcons
                name={leftIconName}
                size={iconSizeStyles[size]}
                color={isInactive ? disabledIconColor[variant] : variantIconColor[variant]}
              /> :null}
            <Text
              style={[
                styles.label,
                labelStyles[variant],
                labelSizeStyles[size],
                isInactive && disabledLabelStyles[variant],
              ]}
            >
              {label}
            </Text>
            {rightIconName ?
              <MaterialIcons
                name={rightIconName}
                size={iconSizeStyles[size]}
                color={isInactive ? disabledIconColor[variant] : variantIconColor[variant]}
              /> : null}
          </View>
        )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.5,
  },
  disabledPrimary: {
    backgroundColor: COLORS.disabledBg,
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
  label: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
  },
});

const buttonVariantStyles = StyleSheet.create({
  primaryContainer: {
    backgroundColor: COLORS.primary,
    boxShadow: `0px 10px 15px rgba(22, 137, 245, 0.14)`,
    elevation: 4,
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryPressed,
  },
  secondaryContainer: {
    backgroundColor: COLORS.surfaceSoft,
  },
  secondaryPressed: {
    backgroundColor: COLORS.borderSoft,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(22, 137, 245, 0.08)',
  },
  lightContainer: {
    backgroundColor: COLORS.lightSurface,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  lightPressed: {
    backgroundColor: COLORS.lightSurfacePressed,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: COLORS.white,
  },
  secondary: {
    color: COLORS.navy,
  },
  ghost: {
    color: COLORS.navy,
  },
  light: {
    color: COLORS.white,
  },
});

const disabledLabelStyles = StyleSheet.create({
  primary: {
    color: COLORS.disabledText,
  },
  secondary: {
    color: COLORS.disabledText,
  },
  ghost: {
    color: COLORS.disabledText,
  },
  light: {
    color: COLORS.lightTextMuted,
  },
});

const labelSizeStyles = StyleSheet.create({
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

const variantStyles = {
  primary: {
    container: buttonVariantStyles.primaryContainer,
    pressed: buttonVariantStyles.primaryPressed,
    disabledContainer: styles.disabledPrimary,
  },
  secondary: {
    container: buttonVariantStyles.secondaryContainer,
    pressed: buttonVariantStyles.secondaryPressed,
    disabledContainer: styles.disabledSecondary,
  },
  ghost: {
    container: buttonVariantStyles.ghostContainer,
    pressed: buttonVariantStyles.ghostPressed,
    disabledContainer: styles.disabledGhost,
  },
  light: {
    container: buttonVariantStyles.lightContainer,
    pressed: buttonVariantStyles.lightPressed,
    disabledContainer: styles.disabledLight,
  },
} satisfies Record<ButtonVariant, ButtonVariantConfig>;

const variantIconColor: Record<ButtonVariant, string> = {
  primary: COLORS.white,
  secondary: COLORS.navy,
  ghost: COLORS.navy,
  light: COLORS.white,
};

const disabledIconColor: Record<ButtonVariant, string> = {
  primary: COLORS.disabledText,
  secondary: COLORS.disabledText,
  ghost: COLORS.disabledText,
  light: COLORS.lightTextMuted,
};

const iconSizeStyles: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};
