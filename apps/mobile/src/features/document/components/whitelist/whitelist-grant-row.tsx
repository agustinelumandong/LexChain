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
  status: string;
  accessLabel: string;
  onPressMenu?: () => void;
};

export function WhitelistGrantRow({
  name,
  status,
  accessLabel,
  onPressMenu,
}: WhitelistGrantRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={styles.name}>{name}</Text>
          {status === 'pending' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: '#FFF8E1',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: '#FFE082',
            }}>
              <MaterialIcons name="schedule" size={10} color="#FF8F00" />
              <Text style={{
                color: '#FF8F00',
                fontFamily: fonts.regular,
                fontSize: 10,
                fontWeight: '700',
                lineHeight: 12,
              }}>Pending</Text>
            </View>
          )}
          {status === 'accepted' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: '#E8F5E9',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: '#A5D6A7',
            }}>
              <MaterialIcons name="check-circle" size={10} color="#2E7D32" />
              <Text style={{
                color: '#2E7D32',
                fontFamily: fonts.regular,
                fontSize: 10,
                fontWeight: '700',
                lineHeight: 12,
              }}>Accepted</Text>
            </View>
          )}
          {status === 'rejected' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: '#FFEBEE',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: '#FFCDD2',
            }}>
              <MaterialIcons name="cancel" size={10} color="#C62828" />
              <Text style={{
                color: '#C62828',
                fontFamily: fonts.regular,
                fontSize: 10,
                fontWeight: '700',
                lineHeight: 12,
              }}>Rejected</Text>
            </View>
          )}
        </View>
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
