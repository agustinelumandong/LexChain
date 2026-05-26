import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import type { DocumentPreviewData } from '@/types';

import { DocumentPreviewSheetContent } from './document-preview-sheet-content';
import { documentPreviewBottomSheetStyles } from './document-preview-bottom-sheet.styles';

type DocumentPreviewBottomSheetProps = {
  visible: boolean;
  document: DocumentPreviewData | null;
  onClose: () => void;
  onVerify: () => void;
  onManageWhitelist?: () => void;
  onAddWhitelist?: () => void;
};

export function DocumentPreviewBottomSheet({
  visible,
  document,
  onClose,
  onVerify,
  onManageWhitelist,
  onAddWhitelist,
}: DocumentPreviewBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={documentPreviewBottomSheetStyles.backdrop}
    />
  );

  if (!visible || !document) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onClose={onClose}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={documentPreviewBottomSheetStyles.handle}
        backgroundStyle={documentPreviewBottomSheetStyles.sheet}
      >
        <BottomSheetScrollView
          style={documentPreviewBottomSheetStyles.scrollArea}
          contentContainerStyle={documentPreviewBottomSheetStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentPreviewSheetContent
            document={document}
            onAddWhitelist={onAddWhitelist}
            onManageWhitelist={onManageWhitelist}
            onPressBack={onClose}
          />
        </BottomSheetScrollView>

        <View style={[documentPreviewBottomSheetStyles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Button
            label="Verify this document"
            fullWidth
            rightIconName="verified-user"
            onPress={onVerify}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
