import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

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
}: ScreenHeaderProps) {
  const isDark = tone === 'dark';
  const iconColor = isDark ? COLORS.white : COLORS.navy;

  return (
    <View style={[styles.header, style]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
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
