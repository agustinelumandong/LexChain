import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
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
      style={uploadTypeBottomSheetStyles.backdrop}
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
    </BottomSheetModal>
  );
}
