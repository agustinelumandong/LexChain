import React, { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, ScreenHeader } from '@/ui';
import {
  DocumentSummaryCard,
  IntegrityCheckCard,
  VerificationStatusCard,
} from '@/features/document';
import { useDocument, useVerifyOnChainDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import { APP_COLORS } from '@/theme';
const HEADER_CONTENT_GAP = 12;
const COLORS = {
  bg: APP_COLORS.bg,
};

function formatDate(value?: string) {
  if (!value) {
    return 'Pending';
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

function formatContentType(value?: string) {
  if (!value) {
    return 'Pending';
  }

  if (value === 'application/pdf') {
    return 'PDF';
  }

  return value.split('/').pop()?.toUpperCase() ?? value;
}

function formatReference(value?: string) {
  if (!value) {
    return 'Pending';
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

export default function VerifyDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const onChainQuery = useVerifyOnChainDocument(documentId);
  const document = documentQuery.data;
  const onChainRecord = onChainQuery.data;
  const chainStatus = onChainQuery.isLoading
    ? 'Verifying'
    : onChainRecord
      ? 'Match'
      : 'No on-chain record';
  const [headerHeight, setHeaderHeight] = useState(126);
  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((h) => (h === nextHeight ? h : nextHeight));
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="VERIFYING DOCS STATUS"
          title="Verifying Docs"
          subtitle="Summary and checks in progress."
          leftAccessibilityLabel="Back"
          onPressLeft={() => router.back()}
          onHeightChange={handleHeaderHeightChange}
          includeTopInset
        />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + HEADER_CONTENT_GAP }]}
          showsVerticalScrollIndicator={false}
        >

          {documentQuery.error ? (
            <ErrorState
              title="Document unavailable"
              message={parseApiError(documentQuery.error).message}
              onRetry={() => {
                void documentQuery.refetch();
              }}
            />
          ) : null}

          <VerificationStatusCard
            title="Processing status"
            steps={[
              { label: 'Document loaded', status: document ? 'done' : 'verifying' },
              {
                label: 'AI processing',
                status: document?.summary ? 'done' : document ? 'verifying' : 'pending',
              },
              {
                label: 'On-chain record',
                status: onChainRecord ? 'done' : onChainQuery.isLoading ? 'verifying' : 'pending',
              },
            ]}
          />

          <DocumentSummaryCard
            title={document?.file_name ?? `Document #${documentId ?? 'unknown'}`}
            rows={[
              { label: 'Reference', value: formatReference(document?.document_id) },
              { label: 'Type', value: formatContentType(document?.content_type) },
              { label: 'Uploaded', value: formatDate(document?.created_at) },
              { label: 'Verified', value: formatDate(onChainRecord?.verified_at) },
            ]}
            summary={document?.summary ?? 'Verification compares the document record against the on-chain anchor when available.'}
          />

          <IntegrityCheckCard
            offChainHash={onChainRecord?.data_hash ?? 'Pending'}
            onChainHash={onChainRecord?.data_hash ?? 'Pending'}
            status={chainStatus}
            onPressViewAnchor={() => {}}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Back to documents"
            variant="secondary"
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
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
