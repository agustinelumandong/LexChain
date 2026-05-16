import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  navy: APP_COLORS.navy,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.white,
  placeholder: '#A9BED8',
};

type UploadReferenceFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export function UploadReferenceField({
  value,
  onChangeText,
  label = 'Reference Number',
  placeholder = 'TX-2026-001',
}: UploadReferenceFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
});
