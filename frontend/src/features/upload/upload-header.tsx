import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
};

type UploadHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function UploadHeader({
  eyebrow = 'UPLOAD DOCUMENT',
  title = 'Upload document',
  description = 'Add a file or use camera.',
}: UploadHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});
