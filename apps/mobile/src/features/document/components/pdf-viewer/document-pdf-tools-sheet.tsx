import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['42%', '85%'], []);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
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
    </BottomSheetModal>
  );
}
