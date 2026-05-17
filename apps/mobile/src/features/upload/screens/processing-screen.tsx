import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiSummaryDraftCard } from '@/features/upload';
import { Button, ScreenHeader } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import { HEADER_CONTENT_GAP } from '../constants/processing.constants';
import { useProcessingDocumentStatus } from '../hooks/use-processing-document-status';
import { useProcessingProgress } from '../hooks/use-processing-progress';
import { isCompleteStatus } from '../utils/processing-status';

const COLORS = {
  bg: APP_COLORS.bg,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
};

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ documentId?: string; status?: string }>();
  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : params.documentId;
  const initialStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const [headerHeight, setHeaderHeight] = useState(126);
  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((h) => (h === nextHeight ? h : nextHeight));
  }, []);
  const documentStatusQuery = useProcessingDocumentStatus(documentId);
  const isDocumentComplete =
    isCompleteStatus(documentStatusQuery.data?.status) || isCompleteStatus(initialStatus);
  const { isComplete, progressValueLabel, statusSteps } =
    useProcessingProgress(isDocumentComplete);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="PROCESSING STATUS"
          title={isComplete ? 'Processing complete' : 'Processing'}
          subtitle={
            isComplete
              ? 'Your document summary is ready and the file can now be found in Documents.'
              : 'LexChain is scanning the upload, drafting the summary, and preparing integrity checks.'
          }
          leftAccessibilityLabel="Back"
          onPressLeft={() => router.back()}
          onHeightChange={handleHeaderHeightChange}
          includeTopInset
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressCard}>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>
                {isComplete ? 'Document ready' : 'Processing document'}
              </Text>
              <Text style={styles.progressBody}>
                {isComplete
                  ? 'All steps finished. Review the draft summary below or head back to Documents.'
                  : 'LexChain is extracting document data, scanning the file, and generating the summary.'}
              </Text>
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMetaLabel}>
                {isComplete ? 'Status: Ready for review' : 'Status: Processing in progress'}
              </Text>
              <Text style={styles.progressMetaValue}>{progressValueLabel}</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Processing status</Text>

            <View style={styles.stepsWrap}>
              {statusSteps.map((step, index) => (
                <View key={step.label} style={styles.stepRow}>
                  <View style={styles.stepLead}>
                    <View
                      style={[
                        styles.dot,
                        step.status === 'done' && styles.dotDone,
                        step.status === 'active' && styles.dotActive,
                      ]}
                    />
                    {index < statusSteps.length - 1 ? <View style={styles.line} /> : null}
                  </View>

                  <View style={styles.stepBody}>
                    <Text
                      style={[
                        styles.stepLabel,
                        step.status === 'pending' && styles.stepLabelPending,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text
                      style={[
                        styles.stepValue,
                        step.status === 'done' && styles.stepValueDone,
                        step.status === 'active' && styles.stepValueActive,
                      ]}
                    >
                      {step.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {isComplete ? (
            <AiSummaryDraftCard
              source="Deed of Sale #1002"
              confidence="High"
              summary="Ownership transfer language, signatories, and key dates were identified from the uploaded document."
              primaryActionLabel="Go to Documents"
              secondaryActionLabel="Upload Another"
              onPressReviewSummary={() => router.replace('/(tabs)/documents')}
              onPressOpenDoc={() => router.replace('/upload')}
            />
          ) : (
            <View style={styles.pendingSummaryCard}>
              <Text style={styles.pendingSummaryTitle}>AI Summary Draft</Text>
              <Text style={styles.pendingSummaryBody}>
                Draft summary will appear here as soon as processing finishes.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={isComplete ? 'Back to documents' : 'Back to documents'}
            fullWidth
            leftIconName="arrow-back"
            onPress={() => router.replace('/(tabs)/documents')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  progressCopy: {
    gap: 6,
  },
  progressTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  progressBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressMetaLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  progressMetaValue: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  stepsWrap: {
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepLead: {
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
  },
  dotDone: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dotActive: {
    borderColor: COLORS.primary,
  },
  line: {
    width: 1,
    flex: 1,
    minHeight: 30,
    marginTop: 4,
    backgroundColor: COLORS.borderSoft,
  },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
  },
  stepLabel: {
    flex: 1,
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  stepLabelPending: {
    color: COLORS.textMuted,
  },
  stepValue: {
    minWidth: 72,
    textAlign: 'right',
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  stepValueDone: {
    color: COLORS.primary,
  },
  stepValueActive: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  pendingSummaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pendingSummaryTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  pendingSummaryBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
