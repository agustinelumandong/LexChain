import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#1689F5',
  white: '#FFFFFF',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
};

type AuthInputProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  iconName: string;
  iconSize?: number;
  iconColor?: string;
  secureTextEntry?: boolean;
};

export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
  iconSize = 18,
  iconColor = COLORS.textMuted,
  secureTextEntry = false,
}: AuthInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrap}>
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
      </View>
  </View>
  );
}


const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});
