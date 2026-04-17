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

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const COLORS = {
  primary: '#1689F5',
  primaryPressed: '#0E73D8',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  white: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  borderSoft: '#D7EBFF',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
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
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? COLORS.white : COLORS.navy}
           />
        ) : (
          <View style={styles.content}>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text style={[styles.label, labelStyles[variant], labelSizeStyles[size]]}>
              {label}
            </Text>
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#1689F5',
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryPressed,
  },
  secondaryContainer: {
    backgroundColor: COLORS.surfaceSoft,
  },
  secondaryPressed: {
    backgroundColor: '#D7EBFF',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(22, 137, 245, 0.08)',
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
    fontSize: 14,
    lineHeight: 18,
  },
});

const variantStylesMap = {
  primary: {
    container: buttonVariantStyles.primaryContainer,
    pressed: buttonVariantStyles.primaryPressed,
  },
  secondary: {
    container: buttonVariantStyles.secondaryContainer,
    pressed: buttonVariantStyles.secondaryPressed,
  },
  ghost: {
    container: buttonVariantStyles.ghostContainer,
    pressed: buttonVariantStyles.ghostPressed,
  },
};

const variantStylesTyped = variantStylesMap satisfies Record<
  ButtonVariant,
  { container: StyleProp<ViewStyle>; pressed: StyleProp<ViewStyle> }
>;

const variantStyles = variantStylesTyped;
