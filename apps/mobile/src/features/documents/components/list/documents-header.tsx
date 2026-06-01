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
  onPressInvitations?: () => void;
  pendingInvitationCount?: number;
};

export function DocumentsHeader({
  eyebrow = 'AUTHORIZED SEARCH',
  title = 'Documents',
  description = 'Find by title, date, or keyword.',
  onPressBooks,
  onPressInvitations,
  pendingInvitationCount = 0,
}: DocumentsHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topLine}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.actions}>
          {onPressInvitations ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open pending invitations"
              onPress={onPressInvitations}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <MaterialIcons name="mail-outline" size={22} color={COLORS.navy} />
              {pendingInvitationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingInvitationCount > 99 ? '99+' : pendingInvitationCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}

          {onPressBooks ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open register books"
              onPress={onPressBooks}
              style={({ pressed }) => [
                styles.booksButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <MaterialIcons name="library-books" size={20} color={COLORS.navy} />
              <Text style={styles.booksText}>Books</Text>
            </Pressable>
          ) : null}
        </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  booksButton: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: APP_COLORS.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    fontFamily: fonts.regular,
  },
  booksText: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
});
