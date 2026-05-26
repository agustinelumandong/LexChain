import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['58%'], []);

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

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onClose={onClose}
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
          <DocumentsSortTopBar onBack={onClose} />

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
            onPress={onClose}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
