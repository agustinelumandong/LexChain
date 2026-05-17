import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiSummaryDraftCard } from '@/features/upload';
import { ScreenHeader } from '@/ui';

import { HEADER_CONTENT_GAP } from '../constants/processing.constants';
import { useProcessingDocumentStatus } from '../hooks/use-processing-document-status';
import { useProcessingProgress } from '../hooks/use-processing-progress';
import { ProcessingFooter } from '../processing-footer';
import { ProcessingPendingSummaryCard } from '../processing-pending-summary-card';
import { ProcessingProgressCard } from '../processing-progress-card';
import { ProcessingStatusCard } from '../processing-status-card';
import { processingScreenStyles as styles } from '../processing-screen.styles';
import { isCompleteStatus } from '../utils/processing-status';

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ documentId?: string; status?: string }>();
  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : params.documentId;
  const initialStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const [headerHeight, setHeaderHeight] = useState(126);
  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
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
          <ProcessingProgressCard
            isComplete={isComplete}
            progressValueLabel={progressValueLabel}
          />

          <ProcessingStatusCard statusSteps={statusSteps} />

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
            <ProcessingPendingSummaryCard />
          )}
        </ScrollView>

        <ProcessingFooter onPressBackToDocuments={() => router.replace('/(tabs)/documents')} />
      </View>
    </SafeAreaView>
  );
}
