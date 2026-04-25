import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiSummaryDraftCard } from '@/features/upload/ai-summary-draft-card';
import { Button } from '@/shared/components/ui/button';
import { DocumentScreenHeader } from '@/features/document/components/document-screen-header';
import { DocumentTopBar } from '@/features/document/components/document-top-bar';
import { VerificationStatusCard } from '@/features/document/components/verification-status-card';

const COLORS = {
  bg: '#F3F8FF',
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
  borderSoft: '#D7EBFF',
};

const PROCESSING_STEPS = [
  { label: 'Uploaded', durationMs: 500 },
  { label: 'Scanning', durationMs: 1400 },
  { label: 'Generating Summary', durationMs: 1500 },
  { label: 'Anchor Pending', durationMs: 1400 },
] as const;

export default function ProcessingScreen() {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(1);

  useEffect(() => {
    if (activeStepIndex >= PROCESSING_STEPS.length) {
      return;
    }

    const timeout = setTimeout(() => {
      setActiveStepIndex((currentStep) => currentStep + 1);
    }, PROCESSING_STEPS[activeStepIndex].durationMs);

    return () => clearTimeout(timeout);
  }, [activeStepIndex]);

  const isComplete = activeStepIndex >= PROCESSING_STEPS.length;
  const completedStepsCount = Math.min(activeStepIndex, PROCESSING_STEPS.length);
  const progressPercent = Math.round(
    (completedStepsCount / PROCESSING_STEPS.length) * 100,
  );

  const statusSteps = useMemo(
    () =>
      PROCESSING_STEPS.map((step, index) => {
        if (index < activeStepIndex) {
          return { label: step.label, status: 'done' as const };
        }

        if (index === activeStepIndex && !isComplete) {
          return { label: step.label, status: 'verifying' as const };
        }

        return { label: step.label, status: 'pending' as const };
      }),
    [activeStepIndex, isComplete],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentTopBar
            label="Processing"
            rightIconName="description"
            onPressBack={() => router.back()}
          />

          <DocumentScreenHeader
            eyebrow="PROCESSING STATUS"
            title={isComplete ? 'Processing complete' : 'Processing'}
            description={
              isComplete
                ? 'Your document summary is ready and the file can now be found in Documents.'
                : 'LexChain is scanning the upload, drafting the summary, and preparing integrity checks.'
            }
          />

          <View style={styles.progressCard}>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>
                {isComplete ? 'Document ready' : 'Processing document'}
              </Text>
              <Text style={styles.progressBody}>
                {isComplete
                  ? 'All steps finished. Review the draft summary below or head back to Documents.'
                  : `${progressPercent}% complete. We are extracting document data, generating the summary, and preparing integrity checks.`}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMetaLabel}>
                {isComplete ? 'Status: Ready for review' : 'Status: Processing in progress'}
              </Text>
              <Text style={styles.progressMetaValue}>{progressPercent}%</Text>
            </View>
          </View>

          <VerificationStatusCard
            title="Processing status"
            steps={statusSteps}
          />

          {isComplete ? (
            <AiSummaryDraftCard
              source="Deed of Sale #1002"
              confidence="High"
              summary="Summary: Ownership transfer language, signatories, and key dates were identified from the uploaded document."
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
            label={isComplete ? 'Back to documents' : 'Cancel and go back'}
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
    shadowColor: '#133B73',
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
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  progressBody: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: COLORS.borderSoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
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
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  progressMetaValue: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  pendingSummaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    shadowColor: '#133B73',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pendingSummaryTitle: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  pendingSummaryBody: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
