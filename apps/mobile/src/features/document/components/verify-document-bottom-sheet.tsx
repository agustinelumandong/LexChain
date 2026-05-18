import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import type { VerifyDocumentData } from '@/types';

import { VerifyDocumentSheetContent } from './verify-document-sheet-content';
import { verifyDocumentBottomSheetStyles } from './verify-document-bottom-sheet.styles';

type VerifyDocumentBottomSheetProps = {
  visible: boolean;
  document: VerifyDocumentData | null;
  onClose: () => void;
  onBackToDetails: () => void;
};

export function VerifyDocumentBottomSheet({
  visible,
  document,
  onClose,
  onBackToDetails,
}: VerifyDocumentBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['88%'], []);

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
      style={verifyDocumentBottomSheetStyles.backdrop}
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
      handleIndicatorStyle={verifyDocumentBottomSheetStyles.handle}
      backgroundStyle={verifyDocumentBottomSheetStyles.sheet}
    >
      <BottomSheetScrollView
        style={verifyDocumentBottomSheetStyles.scrollArea}
        contentContainerStyle={verifyDocumentBottomSheetStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VerifyDocumentSheetContent
          document={document}
          onPressBack={() => bottomSheetRef.current?.dismiss()}
        />
      </BottomSheetScrollView>

      <View style={[verifyDocumentBottomSheetStyles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          label="Close"
          variant="secondary"
          fullWidth
          onPress={onClose}
        />
      </View>
    </BottomSheetModal>
  );
}
