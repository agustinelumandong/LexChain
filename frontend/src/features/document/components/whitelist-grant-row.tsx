import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surfaceSoft: '#F7FBFF',
  dangerBg: '#FFECEF',
  danger: '#D8627B',
  pillBg: '#EAF4FF',
};

type WhitelistGrantRowProps = {
  name: string;
  accessLabel: string;
  actionLabel: string;
  onPressAction?: () => void;
  onPressRevoke?: () => void;
};

export function WhitelistGrantRow({
  name,
  accessLabel,
  actionLabel,
  onPressAction,
  onPressRevoke,
}: WhitelistGrantRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.access}>{accessLabel}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryPill} onPress={onPressAction}>
          <Text style={styles.primaryPillLabel}>{actionLabel}</Text>
        </Pressable>

        <Pressable style={styles.revokePill} onPress={onPressRevoke}>
          <Text style={styles.revokePillLabel}>Revoke</Text>
        </Pressable>
      </View>
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
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  access: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryPill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.pillBg,
  },
  primaryPillLabel: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  revokePill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.dangerBg,
  },
  revokePillLabel: {
    color: COLORS.danger,
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
});
