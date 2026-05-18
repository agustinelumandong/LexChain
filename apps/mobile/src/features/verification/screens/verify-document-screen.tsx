import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DocumentSummaryCard,
  IntegrityCheckCard,
  VerificationStatusCard,
} from '@/features/document';
import { useDocument, useVerifyOnChainDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { Button, ErrorState, ScreenHeader } from '@/ui';

import {
  formatVerificationContentType,
  formatVerificationDate,
  formatVerificationReference,
} from '../utils/verify-document-formatters';
import {
  VERIFY_DOCUMENT_HEADER_CONTENT_GAP,
  verifyDocumentScreenStyles as styles,
} from './verify-document-screen.styles';

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
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + VERIFY_DOCUMENT_HEADER_CONTENT_GAP },
          ]}
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
              { label: 'Reference', value: formatVerificationReference(document?.document_id) },
              { label: 'Type', value: formatVerificationContentType(document?.content_type) },
              { label: 'Uploaded', value: formatVerificationDate(document?.created_at) },
              { label: 'Verified', value: formatVerificationDate(onChainRecord?.verified_at) },
            ]}
            summary={
              document?.summary ??
              'Verification compares the document record against the on-chain anchor when available.'
            }
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
