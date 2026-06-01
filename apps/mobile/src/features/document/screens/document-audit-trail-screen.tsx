import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditTrailCard } from '@/features/document/components/details/document-detail-cards';
import { HEADER_CONTENT_GAP } from '@/features/document/constants/document-details.constants';
import { useDocumentAuditLogs } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';

export default function DocumentAuditTrailScreen() {
  const router = useRouter();
  const { documentId, title } = useLocalSearchParams<{
    documentId: string;
    title?: string;
  }>();
  const normalizedDocumentId = Array.isArray(documentId) ? documentId[0] : documentId;
  const normalizedTitle = Array.isArray(title) ? title[0] : title;
  const auditLogsQuery = useDocumentAuditLogs(normalizedDocumentId);
  const logs = auditLogsQuery.data ?? [];
  const [headerHeight, setHeaderHeight] = useState(126);

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="AUDIT TRAIL"
          title="Document activity"
          subtitle={normalizedTitle ?? 'Recorded changes, access updates, and blockchain events.'}
          leftAccessibilityLabel="Back to document"
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
          {auditLogsQuery.isLoading ? (
            <LoadingState message="Loading audit trail..." />
          ) : null}

          {!auditLogsQuery.isLoading && auditLogsQuery.error ? (
            <ErrorState
              title="Unable to load audit trail"
              message={parseApiError(auditLogsQuery.error).message}
              onRetry={() => {
                void auditLogsQuery.refetch();
              }}
            />
          ) : null}

          {!auditLogsQuery.isLoading && !auditLogsQuery.error && logs.length === 0 ? (
            <EmptyState title="No audit events yet" />
          ) : null}

          {!auditLogsQuery.isLoading && !auditLogsQuery.error && logs.length > 0 ? (
            <AuditTrailCard logs={logs} showAll />
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
});
