import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

import { ThemedText } from '@/shared/components/themed-text';

import type { ButtonProps } from './button.types';
import {
  buttonStyles as styles,
  disabledIconColor,
  disabledLabelStyles,
  iconSizeStyles,
  imageSizeStyles,
  labelSizeStyles,
  labelStyles,
  variantIconColor,
  variantStyles,
} from './button.styles';

export type { ButtonProps, ButtonSize, ButtonVariant } from './button.types';

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
  hugWidth = false,
  height,
  fullRound = false,
  accessibilityLabel,
  iconName,
  leftIconName,
  rightIconName,
  imageSource,
  imageSize,
  imageStyle,
  style,
}: ButtonProps) {
  const isInactive = disabled || loading;
  const hasLabel = Boolean(label);
  const iconOnlyName = !hasLabel && !imageSource
    ? iconName ?? leftIconName ?? rightIconName
    : iconName;
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const fullRoundHeight = fullRound && measuredWidth > 0 ? measuredWidth : undefined;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!fullRound) {
        return;
      }

      const nextWidth = Math.round(event.nativeEvent.layout.width);
      setMeasuredWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth,
      );
    },
    [fullRound],
  );

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        fullWidth && styles.fullWidth,
        !fullWidth && hugWidth && styles.hugWidth,
        height && !fullRound ? { height, minHeight: height } : null,
        fullRoundHeight
          ? { height: fullRoundHeight, minHeight: fullRoundHeight }
          : null,
        fullRound && styles.fullRound,
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
            {imageSource ? (
              <Image
                source={imageSource}
                style={[
                  styles.image,
                  imageSizeStyles[size],
                  imageSize ? { width: imageSize, height: imageSize } : null,
                  imageStyle,
                ]}
                contentFit="contain"
              />
            ) : null}
            {iconOnlyName ? (
              <MaterialIcons
                name={iconOnlyName}
                size={iconSizeStyles[size]}
                color={isInactive ? disabledIconColor[variant] : variantIconColor[variant]}
              />
            ) : null}
            {hasLabel && leftIconName && !iconName && !imageSource ?
              <MaterialIcons
                name={leftIconName}
                size={iconSizeStyles[size]}
                color={isInactive ? disabledIconColor[variant] : variantIconColor[variant]}
              /> :null}
            {hasLabel ? (
              <ThemedText
                style={[
                  styles.label,
                  labelStyles[variant],
                  labelSizeStyles[size],
                  isInactive && disabledLabelStyles[variant],
                ]}
              >
                {label}
              </ThemedText>
            ) : null}
            {hasLabel && rightIconName ?
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
