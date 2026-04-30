import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import type { VerifyDocumentData } from '@/types';
import { DocumentScreenHeader } from './document-screen-header';
import { DocumentSummaryCard } from './document-summary-card';
import { DocumentTopBar } from './document-top-bar';
import { IntegrityCheckCard } from './integrity-check-card';
import { VerificationStatusCard } from './verification-status-card';

import { APP_COLORS } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  borderSoft: APP_COLORS.borderSoft,
};

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
      style={styles.backdrop}
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
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DocumentTopBar
          label="Verifying Docs"
          rightIconName="fact-check"
          onPressBack={() => bottomSheetRef.current?.dismiss()}
        />

        <DocumentScreenHeader
          eyebrow="VERIFYING DOCS STATUS"
          title="Verifying Docs"
          description="Summary and checks in progress."
        />

        <VerificationStatusCard
          title="Processing status"
          steps={document.steps}
        />

        <DocumentSummaryCard
          title={document.title}
          rows={document.summaryRows}
          summary={document.summary}
        />

        <IntegrityCheckCard
          offChainHash={document.offChainHash}
          onChainHash={document.onChainHash}
          status={document.integrityStatus}
          onPressViewAnchor={() => {}}
        />
      </BottomSheetScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#B9D9FF',
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
