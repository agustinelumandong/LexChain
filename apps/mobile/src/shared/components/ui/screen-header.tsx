import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  white: APP_COLORS.white,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  darkTextMuted: '#B8CCE8',
  darkAction: 'rgba(255,255,255,0.10)',
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
  const iconColor = isDark ? COLORS.white : COLORS.navy;
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

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.surface,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  darkActionButton: {
    backgroundColor: COLORS.darkAction,
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
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },
  darkTitle: {
    color: COLORS.white,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  darkSubtitle: {
    color: COLORS.darkTextMuted,
  },
});
