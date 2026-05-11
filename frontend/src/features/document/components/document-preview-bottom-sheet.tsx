import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import type { DocumentPreviewData } from '@/types';
import { AccessWhitelistCard } from './access-whitelist-card';
import { DetailSectionsCard } from './detail-sections-card';
import { DocumentScreenHeader } from './document-screen-header';
import { DocumentSummaryCard } from './document-summary-card';
import { DocumentTopBar } from './document-top-bar';

import { APP_COLORS } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  borderSoft: APP_COLORS.borderSoft,
};

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
          label="Details"
          rightIconName="description"
          onPressBack={() => bottomSheetRef.current?.dismiss()}
        />

        <DocumentScreenHeader
          eyebrow="DOCUMENT DETAILS"
          title="Document details"
          description="Core summary, files, clauses, and topical context."
        />

        <DocumentSummaryCard
          title={document.title}
          rows={document.summaryRows}
          summary={document.summary}
        />

        <AccessWhitelistCard
          allowedCountLabel={document.whitelist.allowedCountLabel}
          helperText={document.whitelist.helperText}
          onPressManage={onManageWhitelist}
          onPressAdd={onAddWhitelist}
        />

        <DetailSectionsCard
          sections={document.sections}
          confidenceLabel={document.confidenceLabel}
          confidenceValue={document.confidenceValue}
        />
      </BottomSheetScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
    backgroundColor: COLORS.borderSoft,
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
