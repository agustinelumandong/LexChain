import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['88%'], []);

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
            onPressBack={onClose}
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
      </BottomSheet>
    </View>
  );
}
