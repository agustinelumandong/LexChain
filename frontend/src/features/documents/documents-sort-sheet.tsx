import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui/button';

const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: '#F3F8FF',
  surface: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
};

type SortOption = {
  label: string;
  value: string;
  helperText?: string;
};

type DocumentsSortSheetProps = {
  visible: boolean;
  options: SortOption[];
  selectedSort: string;
  onClose: () => void;
  onSelectSort: (value: string) => void;
};

export function DocumentsSortSheet({
  visible,
  options,
  selectedSort,
  onClose,
  onSelectSort,
}: DocumentsSortSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['58%'], []);

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
      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.leftAction} onPress={() => bottomSheetRef.current?.dismiss()}>
            <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
            <Text style={styles.topBarLabel}>Documents</Text>
          </Pressable>

          <MaterialIcons name="swap-vert" size={18} color={COLORS.textMuted} />
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>SORT DOCUMENTS</Text>
          <Text style={styles.title}>Sort order</Text>
          <Text style={styles.description}>
            Choose how your document list should be arranged.
          </Text>
        </View>

        <View style={styles.optionList}>
          {options.map((option) => {
            const isSelected = option.value === selectedSort;

            return (
              <Pressable
                key={option.value}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => onSelectSort(option.value)}
              >
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  {option.helperText ? (
                    <Text style={styles.optionHelper}>{option.helperText}</Text>
                  ) : null}
                </View>

                {isSelected ? (
                  <MaterialIcons name="check-circle" size={18} color={COLORS.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          label="Done"
          fullWidth
          onPress={() => bottomSheetRef.current?.dismiss()}
        />
      </View>
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
    backgroundColor: '#B9D9FF',
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  headerBlock: {
    gap: 8,
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
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionRowSelected: {
    backgroundColor: COLORS.surfaceSoft,
    borderColor: '#A8D1FF',
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionHelper: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
