import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UploadTypeOptionRow } from './upload-type-option-row';
import { uploadTypeBottomSheetStyles } from './upload-type-bottom-sheet.styles';

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['52%'], []);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={uploadTypeBottomSheetStyles.backdrop}
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
        handleIndicatorStyle={uploadTypeBottomSheetStyles.handle}
        backgroundStyle={uploadTypeBottomSheetStyles.sheet}
      >
        <BottomSheetView style={[uploadTypeBottomSheetStyles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={uploadTypeBottomSheetStyles.header}>
            <Text style={uploadTypeBottomSheetStyles.eyebrow}>DOCUMENT TYPE</Text>
            <Text style={uploadTypeBottomSheetStyles.title}>Choose document type</Text>
            <Text style={uploadTypeBottomSheetStyles.description}>
              Pick the document category before uploading.
            </Text>
          </View>

          <View style={uploadTypeBottomSheetStyles.options}>
            {options.map((option) => {
              const isSelected = option === selectedType;

              return (
                <UploadTypeOptionRow
                  key={option}
                  option={option}
                  selected={isSelected}
                  onPress={() => onSelect(option)}
                />
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
