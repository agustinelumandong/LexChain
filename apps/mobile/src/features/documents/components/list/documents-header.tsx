import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

type DocumentsHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  onPressBooks?: () => void;
};

export function DocumentsHeader({
  eyebrow = 'AUTHORIZED SEARCH',
  title = 'Documents',
  description = 'Find by title, date, or keyword.',
  onPressBooks,
}: DocumentsHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topLine}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {onPressBooks ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open register books"
            onPress={onPressBooks}
            style={({ pressed }) => [
              styles.booksButton,
              pressed && styles.booksButtonPressed,
            ]}
          >
            <MaterialIcons name="library-books" size={17} color={COLORS.primary} />
            <Text style={styles.booksText}>Books</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  booksButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  booksButtonPressed: {
    opacity: 0.72,
  },
  booksText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
});
