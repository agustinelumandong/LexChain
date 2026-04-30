import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Button } from '@/ui';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  overlay: 'rgba(4, 18, 40, 0.48)',
  surface: APP_COLORS.white,
  surfaceSoft: '#F7FBFF',
  borderSoft: APP_COLORS.borderSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

export type SettingsInfoModalData = {
  title: string;
  description: string;
  bullets: string[];
};

type SettingsInfoModalProps = {
  visible: boolean;
  data: SettingsInfoModalData | null;
  onClose: () => void;
};

export function SettingsInfoModal({
  visible,
  data,
  onClose,
}: SettingsInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>PROFILE SETTING</Text>
              <Text style={styles.title}>{data?.title ?? 'Settings'}</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={18} color={COLORS.navy} />
            </Pressable>
          </View>

          <Text style={styles.description}>
            {data?.description ?? 'More details will appear here.'}
          </Text>

          <View style={styles.pointsWrap}>
            {(data?.bullets ?? []).map((bullet) => (
              <View key={bullet} style={styles.pointRow}>
                <View style={styles.pointDot} />
                <Text style={styles.pointText}>{bullet}</Text>
              </View>
            ))}
          </View>

          <Button label="Close" fullWidth onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalCard: {
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    padding: 20,
    gap: 16,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  pointsWrap: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surfaceSoft,
    padding: 16,
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: COLORS.primary,
  },
  pointText: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
});
