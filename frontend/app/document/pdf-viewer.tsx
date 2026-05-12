import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DocumentScreenHeader,
  DocumentTopBar,
  LexChainPdfViewer,
  getDocumentPermissions,
} from '@/features/document';
import { Button } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import type { DocumentPermission } from '@/types';

const COLORS = {
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  primary: APP_COLORS.primary,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
  white: APP_COLORS.white,
};

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type PdfToolsSheetProps = {
  visible: boolean;
  documentId?: string;
  title: string;
  permissions: DocumentPermission;
  onClose: () => void;
};

function PdfToolsSheet({
  visible,
  documentId,
  title,
  permissions,
  onClose,
}: PdfToolsSheetProps) {
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
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.sheetHeader}>
        <View style={styles.sheetIcon}>
          <MaterialIcons name="verified-user" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.sheetHeaderCopy}>
          <Text style={styles.sheetTitle}>Document tools</Text>
          <Text style={styles.sheetSubtitle} numberOfLines={1}>{title}</Text>
        </View>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.metadataText}>
          Summary, verification, clauses, parties, access, and OCR can move into tabs here once the backend returns full PDF metadata.
        </Text>

        <View style={styles.chipRow}>
          {permissions.canViewSummary ? <Text style={styles.chip}>Summary</Text> : null}
          {permissions.canViewOcrText ? <Text style={styles.chip}>OCR text</Text> : null}
          {permissions.canVerifyDocument ? <Text style={styles.chip}>Verification</Text> : null}
          {permissions.canInviteUsers ? <Text style={styles.chip}>Access</Text> : null}
        </View>

        <Button
          label={permissions.canDownloadPdf ? 'Download PDF' : 'Download restricted'}
          variant="secondary"
          size="sm"
          leftIconName="download"
          disabled={!permissions.canDownloadPdf}
        />

        {documentId ? (
          <Text style={styles.reference}>Reference {documentId}</Text>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export default function DocumentPdfViewerScreen() {
  const router = useRouter();
  const [isToolsSheetVisible, setIsToolsSheetVisible] = useState(false);
  const params = useLocalSearchParams<{
    documentId?: string;
    title?: string;
    uri?: string;
    role?: string;
  }>();

  const documentId = getStringParam(params.documentId);
  const title = getStringParam(params.title) ?? 'Document PDF';
  const uri = getStringParam(params.uri);
  const permissions = useMemo(
    () => getDocumentPermissions(getStringParam(params.role)),
    [params.role],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <DocumentTopBar
          label="PDF Viewer"
          rightIconName="info-outline"
          onPressBack={() => router.back()}
          onPressRight={() => setIsToolsSheetVisible(true)}
        />

        <DocumentScreenHeader
          eyebrow="DOCUMENT PDF"
          title={title}
          description="Read the original document and keep LexChain metadata close by."
        />

        {permissions.canViewPdf ? (
          <View style={styles.viewerFrame}>
            <LexChainPdfViewer uri={uri} />
            <View pointerEvents="none" style={styles.watermarkOverlay}>
              <Text style={styles.watermarkText}>LexChain Verified</Text>
            </View>
          </View>
        ) : (
          <View style={styles.blockedCard}>
            <MaterialIcons name="lock" size={24} color={COLORS.primary} />
            <Text style={styles.blockedTitle}>PDF access restricted</Text>
            <Text style={styles.blockedText}>
              Your current document role can view the summary, but not the original PDF.
            </Text>
          </View>
        )}
      </View>

      <PdfToolsSheet
        visible={isToolsSheetVisible}
        documentId={documentId}
        title={title}
        permissions={permissions}
        onClose={() => setIsToolsSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  viewerFrame: {
    flex: 1,
    minHeight: 0,
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkText: {
    transform: [{ rotate: '-28deg' }],
    color: 'rgba(0, 56, 116, 0.12)',
    fontFamily: fonts.regular,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  blockedCard: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  blockedTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  blockedText: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sheetBackground: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.borderSoft,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  sheetIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: COLORS.surfaceSoft,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  sheetSubtitle: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  metadataText: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    backgroundColor: COLORS.surfaceSoft,
  },
  reference: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
