import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { APP_COLORS } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  screenHeaderColors,
  screenHeaderStyles as styles,
} from './screen-header.styles';

type ScreenHeaderTone = 'light' | 'dark';

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onPressLeft: () => void;
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  leftAccessibilityLabel?: string;
  onPressRight?: () => void;
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightAccessibilityLabel?: string;
  tone?: ScreenHeaderTone;
  style?: StyleProp<ViewStyle>;
  onHeightChange?: (height: number) => void;
  includeTopInset?: boolean;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  onPressLeft,
  leftIconName = 'arrow-back',
  leftAccessibilityLabel = 'Go back',
  onPressRight,
  rightIconName,
  rightAccessibilityLabel,
  tone = 'light',
  style,
  onHeightChange,
  includeTopInset = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark = tone === 'dark';
  const iconColor = isDark ? screenHeaderColors.white : screenHeaderColors.navy;
  const headerTopPadding = includeTopInset ? insets.top + 14 : 14;
  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.wrapper, style]} onLayout={handleLayout}>
      <View style={styles.shadow}>
        <BlurView intensity={100} tint="light" style={styles.glass}>
          <LinearGradient
            colors={[
              APP_COLORS.borderSoft,
              'rgba(243, 248, 255, 0)',
            ]}
            style={[styles.header, { paddingTop: headerTopPadding }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={leftAccessibilityLabel}
              style={({ pressed }) => [
                styles.actionButton,
                isDark ? styles.darkActionButton : styles.lightActionButton,
                pressed && styles.pressed,
              ]}
              onPress={onPressLeft}
            >
              <MaterialIcons name={leftIconName} size={20} color={iconColor} />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={[styles.title, isDark && styles.darkTitle]}>{title}</Text>
              <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>{subtitle}</Text>
            </View>

            {rightIconName && onPressRight ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={rightAccessibilityLabel}
                style={({ pressed }) => [
                  styles.actionButton,
                  isDark ? styles.darkActionButton : styles.lightActionButton,
                  pressed && styles.pressed,
                ]}
                onPress={onPressRight}
              >
                <MaterialIcons name={rightIconName} size={20} color={iconColor} />
              </Pressable>
            ) : (
              <View style={styles.actionSpacer} />
            )}
            <View pointerEvents="none" style={styles.glassHighlight} />
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
}
