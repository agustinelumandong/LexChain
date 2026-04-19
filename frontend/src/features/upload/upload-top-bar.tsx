import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  navy: '#133B73',
};

type UploadTopBarProps = {
  onPressBack?: () => void;
  onPressCamera?: () => void;
};

export function UploadTopBar({
  onPressBack,
  onPressCamera,
}: UploadTopBarProps) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.leftGroup} onPress={onPressBack}>
        <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
        <Text style={styles.title}>Upload</Text>
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
  title: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
});
