import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surfaceSoft: '#F7FBFF',
  pillBg: APP_COLORS.surfaceSoft,
};

type WhitelistGrantRowProps = {
  name: string;
  accessLabel: string;
  onPressMenu?: () => void;
};

export function WhitelistGrantRow({
  name,
  accessLabel,
  onPressMenu,
}: WhitelistGrantRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.access}>{accessLabel}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open access menu for ${name}`}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        onPress={onPressMenu}
      >
        <MaterialIcons name="more-horiz" size={22} color={COLORS.navy} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  access: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: COLORS.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonPressed: {
    opacity: 0.72,
  },
});
