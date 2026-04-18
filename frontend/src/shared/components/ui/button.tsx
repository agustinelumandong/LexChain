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
};

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
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
          <ActivityIndicator
            size="small"
            color={variantIconColor[variant]}
           />
        ) : (
          <View style={styles.content}>
            {leftIconName ?
              <MaterialIcons
                name={leftIconName}
                size={iconSizeStyles[size]}
                color={variantIconColor[variant]}
              /> :null}
            <Text style={[styles.label, labelStyles[variant], labelSizeStyles[size]]}>
              {label}
            </Text>
            {rightIconName ?
              <MaterialIcons
                name={rightIconName}
                size={iconSizeStyles[size]}
                color={variantIconColor[variant]}
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
    shadowColor: COLORS.primary,
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
    backgroundColor: COLORS.borderSoft,
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
    fontSize: 16,
    lineHeight: 22,
  },
});

const variantStyles = {
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
} satisfies Record<ButtonVariant, { container: StyleProp<ViewStyle>; pressed: StyleProp<ViewStyle> }>;

const variantIconColor: Record<ButtonVariant, string> = {
  primary: COLORS.white,
  secondary: COLORS.navy,
  ghost: COLORS.navy,
};

const iconSizeStyles: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};
