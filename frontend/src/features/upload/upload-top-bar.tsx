import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fonts } from '@/theme';
const COLORS = {
  navy: '#133B73',
  primary: '#1689F5',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
};

type UploadTopBarProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  onPressBack?: () => void;
  onPressCamera?: () => void;
};

export function UploadTopBar({
  eyebrow = 'UPLOAD DOCUMENT',
  title = 'Upload document',
  description = 'Add a file or use camera.',
  onPressBack,
  onPressCamera,
}: UploadTopBarProps) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.leftGroup} onPress={onPressBack}>
        <View style={styles.backButtonCapsule}>
          <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
        </View>
        <View style={styles.innerWrap}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.innerTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      </Pressable>

      <Pressable onPress={onPressCamera}>
        <MaterialIcons name="photo-camera" size={18} color={COLORS.navy} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButtonCapsule: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  innerWrap: {
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
    innerTitle: {
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
});
