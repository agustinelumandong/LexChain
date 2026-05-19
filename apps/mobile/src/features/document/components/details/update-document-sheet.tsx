import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui';
import type { PickedUploadFile } from '@/types';

import { UpdateDocumentFilePicker } from './update-document-file-picker';
import { updateDocumentSheetStyles } from './update-document-sheet.styles';
import { UpdateDocumentUploadProgress } from './update-document-upload-progress';

type UpdateDocumentSheetProps = {
  visible: boolean;
  selectedFile: PickedUploadFile | null;
  isLoading: boolean;
  onClose: () => void;
  onPickFile: () => void;
  onUpload: () => void;
};

export function UpdateDocumentSheet({
  visible,
  selectedFile,
  isLoading,
  onClose,
  onPickFile,
  onUpload,
}: UpdateDocumentSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ['55%', '80%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (!isLoading) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 950,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isLoading, progressAnim]);

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 220],
  });

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
        backgroundStyle={updateDocumentSheetStyles.sheetBackground}
        handleIndicatorStyle={updateDocumentSheetStyles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={updateDocumentSheetStyles.updateSheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={updateDocumentSheetStyles.sheetHeader}>
            <Text style={updateDocumentSheetStyles.sheetTitle}>Update document</Text>
            <Text style={updateDocumentSheetStyles.sheetSubtitle}>
              Select a replacement PDF, then confirm upload when ready.
            </Text>
          </View>

          <UpdateDocumentFilePicker
            selectedFile={selectedFile}
            disabled={isLoading}
            onPickFile={onPickFile}
          />

          {isLoading ? (
            <UpdateDocumentUploadProgress progressTranslateX={progressTranslateX} />
          ) : null}

          <Button
            label={isLoading ? 'Updating document...' : 'Upload update'}
            fullWidth
            loading={isLoading}
            disabled={!selectedFile || isLoading}
            leftIconName="upload-file"
            onPress={onUpload}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
