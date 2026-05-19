import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { DocumentPermission } from '@/types';

import { DocumentPdfToolsContent } from './document-pdf-tools-content';
import { DocumentPdfToolsHeader } from './document-pdf-tools-header';
import { documentPdfToolsSheetStyles } from './document-pdf-tools-sheet.styles';

type DocumentPdfToolsSheetProps = {
  visible: boolean;
  documentId?: string;
  title: string;
  permissions: DocumentPermission;
  onClose: () => void;
};

export function DocumentPdfToolsSheet({
  visible,
  documentId,
  title,
  permissions,
  onClose,
}: DocumentPdfToolsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['42%', '85%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
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
        backgroundStyle={documentPdfToolsSheetStyles.sheetBackground}
        handleIndicatorStyle={documentPdfToolsSheetStyles.handleIndicator}
      >
        <DocumentPdfToolsHeader title={title} />

        <BottomSheetScrollView
          contentContainerStyle={documentPdfToolsSheetStyles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentPdfToolsContent documentId={documentId} permissions={permissions} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
