import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.white,
};

type DocumentsSearchFieldProps = {
  label?: string;
  placeholder?: string;
  onPress?: () => void;
};

export function DocumentsSearchField({
  label = 'Search documents',
  placeholder = 'Title, keyword, date, or hash',
  onPress,
}: DocumentsSearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.field,
          pressed && styles.fieldPressed,
        ]}
        onPress={onPress}
      >
        <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  field: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  fieldPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
});
