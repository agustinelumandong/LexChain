import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';
import { ScreenHeader } from '@/ui';

import { LexChainPdfViewer } from '../components/pdf-viewer/lexchain-pdf-viewer';
import { DocumentPdfToolsSheet } from '../components/pdf-viewer/document-pdf-tools-sheet';
import { useDocumentPdfViewer } from '../hooks/use-document-pdf-viewer';

const HEADER_CONTENT_GAP = 12;

const COLORS = {
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  primary: APP_COLORS.primary,
  surface: APP_COLORS.surface,
  textMuted: APP_COLORS.textMuted,
  white: APP_COLORS.white,
};

export default function DocumentPdfViewerScreen() {
  const viewer = useDocumentPdfViewer();

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        eyebrow="DOCUMENT PDF"
        title={viewer.title}
        subtitle="Read the original document and keep LexChain metadata close by."
        leftAccessibilityLabel="Back to document details"
        rightIconName="info-outline"
        rightAccessibilityLabel="Open document tools"
        onPressLeft={viewer.handleBack}
        onPressRight={viewer.handleOpenTools}
        onHeightChange={viewer.handleHeaderHeightChange}
        includeTopInset
      />
      <View style={[styles.content, { paddingTop: viewer.headerHeight + HEADER_CONTENT_GAP }]}>
        {viewer.permissions.canViewPdf ? (
          <View style={styles.viewerFrame}>
            <LexChainPdfViewer uri={viewer.uri} />
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

      <DocumentPdfToolsSheet
        visible={viewer.isToolsSheetVisible}
        documentId={viewer.documentId}
        title={viewer.title}
        permissions={viewer.permissions}
        onClose={viewer.handleCloseTools}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
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
});
