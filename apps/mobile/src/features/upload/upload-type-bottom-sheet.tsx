import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  primary: APP_COLORS.primary,
  primarySoft: APP_COLORS.surfaceSoft,
};

type UploadTypeBottomSheetProps = {
  visible: boolean;
  selectedType: string;
  options: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function UploadTypeBottomSheet({
  visible,
  selectedType,
  options,
  onClose,
  onSelect,
}: UploadTypeBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['52%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    return () => {
      sheet?.dismiss();
    };
  }, []);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={styles.backdrop}
    />
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DOCUMENT TYPE</Text>
          <Text style={styles.title}>Choose document type</Text>
          <Text style={styles.description}>
            Pick the document category before uploading.
          </Text>
        </View>

        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = option === selectedType;

            return (
              <Pressable
                key={option}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onSelect(option)}
              >
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option}
                  </Text>
                  <Text style={styles.optionHint}>
                    {isSelected ? 'Currently selected' : 'Tap to select'}
                  </Text>
                </View>

                {isSelected ? (
                  <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                ) : (
                  <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    gap: 10,
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
    lineHeight: 26,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 62,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionHint: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
