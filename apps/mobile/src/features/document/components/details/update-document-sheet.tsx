import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/ui';
import type { PickedUploadFile } from '@/types';
import { APP_COLORS, fonts } from '@/theme';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.updateSheetContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Update document</Text>
          <Text style={styles.sheetSubtitle}>
            Select a replacement PDF, then confirm upload when ready.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.filePickerCard, pressed && styles.menuRowPressed]}
          onPress={onPickFile}
          disabled={isLoading}
        >
          <View style={styles.filePickerIcon}>
            <MaterialIcons name="picture-as-pdf" size={24} color={APP_COLORS.primary} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.filePickerTitle}>
              {selectedFile ? selectedFile.name : 'Choose PDF file'}
            </Text>
            <Text style={styles.filePickerDescription}>
              {selectedFile?.sizeLabel ?? 'No file selected yet'}
            </Text>
          </View>
          <MaterialIcons name="upload-file" size={22} color={APP_COLORS.textMuted} />
        </Pressable>

        {isLoading ? (
          <View style={styles.uploadProgressCard}>
            <Text style={styles.uploadProgressLabel}>Updating document...</Text>
            <View style={styles.uploadProgressTrack}>
              <Animated.View
                style={[
                  styles.uploadProgressFill,
                  { transform: [{ translateX: progressTranslateX }] },
                ]}
              />
            </View>
          </View>
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
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  menuRowPressed: {
    opacity: 0.72,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: APP_COLORS.bg,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  handleIndicator: {
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: APP_COLORS.borderSoft,
  },
  updateSheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 18,
  },
  sheetHeader: {
    gap: 8,
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  filePickerCard: {
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  filePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  filePickerDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  uploadProgressCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  uploadProgressLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  uploadProgressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.borderSoft,
  },
  uploadProgressFill: {
    width: '42%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
  },
});
