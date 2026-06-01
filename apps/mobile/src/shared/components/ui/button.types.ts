import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Image } from 'expo-image';
import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  hugWidth?: boolean;
  height?: number;
  fullRound?: boolean;
  accessibilityLabel?: string;
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  imageSource?: React.ComponentProps<typeof Image>['source'];
  imageSize?: number;
  imageStyle?: React.ComponentProps<typeof Image>['style'];
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  iconColor?: string;
};
