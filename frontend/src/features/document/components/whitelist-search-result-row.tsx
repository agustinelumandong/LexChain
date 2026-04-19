import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
  borderSoft: '#D7EBFF',
};

type WhitelistSearchResultRowProps = {
  name: string;
  email: string;
  onPressAdd?: () => void;
  roundedTop?: boolean;
  roundedBottom?: boolean;
};

export function WhitelistSearchResultRow({
  name,
  email,
  onPressAdd,
  roundedTop = false,
  roundedBottom = false,
}: WhitelistSearchResultRowProps) {
  return (
    <Pressable
      style={[
        styles.row,
        // roundedTop && styles.roundedTop,
        roundedBottom && styles.roundedBottom,
      ]}
      onPress={onPressAdd}
    >
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <MaterialIcons name="add" size={22} color={COLORS.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  roundedTop: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  roundedBottom: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
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
  email: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
