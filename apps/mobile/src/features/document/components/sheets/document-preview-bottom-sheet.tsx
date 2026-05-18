import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible && document) {
      sheet.present();
      return () => {
        sheet.dismiss();
      };
    }

    sheet.dismiss();
    return () => {
      sheet.dismiss();
    };
  }, [document, visible]);

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

  if (!document) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
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
          onPressBack={() => bottomSheetRef.current?.dismiss()}
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
    </BottomSheetModal>
  );
}
