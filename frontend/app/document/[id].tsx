import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DetailSectionsCard,
  DocumentScreenHeader,
  DocumentSummaryCard,
  DocumentTopBar,
} from '@/features/document';
import { Button, ErrorState, LoadingState } from '@/ui';
import { useDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import { APP_COLORS } from '@/theme';

const COLORS = {
  bg: APP_COLORS.bg,
};

function formatDate(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function stringifyInsight(value: Record<string, unknown>) {
  const entries = Object.entries(value);

  if (entries.length === 0) {
    return 'No details';
  }

  return entries
    .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
    .join(', ');
}

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const document = documentQuery.data;

  const detailSections = useMemo(() => {
    if (!document) {
      return [];
    }

    return [
      {
        title: 'Core fields',
        rows: [
          { label: 'Content type', value: document.content_type },
          { label: 'Status', value: document.status },
          { label: 'Uploaded', value: formatDate(document.created_at) },
        ],
      },
      {
        title: 'Risk flags',
        body: document.risk_flags?.length
          ? document.risk_flags.map(stringifyInsight).join('\n')
          : 'No risk flags yet',
      },
    ];
  }, [document]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentTopBar
            label="Details"
            rightIconName="description"
            onPressBack={() => router.back()}
          />

          <DocumentScreenHeader
            eyebrow="DOCUMENT DETAILS"
            title={document?.file_name ?? 'Document details'}
            description="Core summary, labels, extracted entities, and risk flags."
          />

          {documentQuery.isLoading ? (
            <LoadingState message="Loading document..." />
          ) : documentQuery.error ? (
            <ErrorState
              title="Document unavailable"
              message={parseApiError(documentQuery.error).message}
              onRetry={() => {
                void documentQuery.refetch();
              }}
            />
          ) : document ? (
            <>
              <DocumentSummaryCard
                title={document.file_name}
                rows={[
                  { label: 'Reference', value: document.document_id },
                  { label: 'Status', value: document.status },
                  { label: 'Uploaded', value: formatDate(document.created_at) },
                ]}
                summary={document.summary ?? 'Summary is not ready yet.'}
              />

              <DetailSectionsCard
                sections={detailSections}
                confidenceLabel="Processing"
                confidenceValue={document.status}
              />
            </>
          ) : (
            <ErrorState title="Document not found" message="No document data returned." />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Back to documents"
            fullWidth
            leftIconName="arrow-back"
            onPress={() => router.push('/(tabs)/documents')}
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
