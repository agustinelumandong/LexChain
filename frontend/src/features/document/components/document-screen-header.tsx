import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';
const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
};

type DocumentScreenHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DocumentScreenHeader({
  eyebrow,
  title,
  description,
}: DocumentScreenHeaderProps) {
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
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});
