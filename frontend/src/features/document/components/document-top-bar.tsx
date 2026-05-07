import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

type DocumentTopBarProps = {
  label: string;
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  onPressBack?: () => void;
  onPressRight?: () => void;
};

export function DocumentTopBar({
  label,
  rightIconName,
  onPressBack,
  onPressRight,
}: DocumentTopBarProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={onPressBack}
        style={styles.leftAction}
      >
        <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>

      {rightIconName && (
        <Pressable onPress={onPressRight} style={styles.rightAction}>
          <MaterialIcons name={rightIconName} size={18} color={COLORS.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightAction: {
    padding: 4,
  },
  label: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
});
