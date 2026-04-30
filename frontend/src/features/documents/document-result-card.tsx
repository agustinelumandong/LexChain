import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.surfaceSoft,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
};

type DocumentResultCardProps = {
  title: string;
  parties: string;
  date: string;
  onPressCard?: () => void;
  onPressOpen?: () => void;
  onPressMore?: () => void;
};

export function DocumentResultCard({
  title,
  parties,
  date,
  onPressCard,
  onPressOpen,
  onPressMore,
}: DocumentResultCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPressCard}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onPressMore}
          style={styles.moreButton}
        >
          <MaterialIcons name="shield" size={18} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaWrap}>
          <Text style={styles.meta}>Parties: {parties}</Text>
          <Text style={styles.meta}>Date: {date}</Text>
        </View>

        <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={onPressOpen}>
          <Text style={[styles.actionLabel, styles.primaryLabel]}>Open</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  primaryLabel: {
    color: APP_COLORS.white,
  },
});
