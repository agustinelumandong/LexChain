import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';

import { DocumentsSortOptionRow, type SortOption } from './documents-sort-option-row';
import { documentsSortSheetStyles } from './documents-sort-sheet.styles';
import { DocumentsSortTopBar } from './documents-sort-top-bar';

export type { SortOption } from './documents-sort-option-row';

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
      style={documentsSortSheetStyles.backdrop}
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
      handleIndicatorStyle={documentsSortSheetStyles.handle}
      backgroundStyle={documentsSortSheetStyles.sheet}
    >
      <BottomSheetScrollView
        style={documentsSortSheetStyles.scrollArea}
        contentContainerStyle={documentsSortSheetStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DocumentsSortTopBar onBack={() => bottomSheetRef.current?.dismiss()} />

        <View style={documentsSortSheetStyles.headerBlock}>
          <Text style={documentsSortSheetStyles.eyebrow}>SORT DOCUMENTS</Text>
          <Text style={documentsSortSheetStyles.title}>Sort order</Text>
          <Text style={documentsSortSheetStyles.description}>
            Choose how your document list should be arranged.
          </Text>
        </View>

        <View style={documentsSortSheetStyles.optionList}>
          {options.map((option) => {
            const isSelected = option.value === selectedSort;

            return (
              <DocumentsSortOptionRow
                key={option.value}
                option={option}
                selected={isSelected}
                onPress={() => onSelectSort(option.value)}
              />
            );
          })}
        </View>
      </BottomSheetScrollView>

      <View style={[documentsSortSheetStyles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          label="Done"
          fullWidth
          onPress={() => bottomSheetRef.current?.dismiss()}
        />
      </View>
    </BottomSheetModal>
  );
}
