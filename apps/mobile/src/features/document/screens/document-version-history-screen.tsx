import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { VersionHistoryCard } from '@/features/document/components/details/document-detail-cards';
import {
  DEFAULT_DOCUMENT_HEADER_HEIGHT,
  HEADER_CONTENT_GAP,
} from '@/features/document/constants/document-details.constants';
import { useDocument, useDocumentVersions, queryKeys } from '@/services/query';
import { documentsApi } from '@/services/api';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';

import { useDocumentFileVersion } from '../hooks/use-document-file-version';
import type {
  DocumentDetailsDocument,
  VersionHistoryItem,
} from '../types/document-details.types';
import { getDocumentPdfUri } from '../utils/document-details-formatters';

export default function DocumentVersionHistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { documentId, title, role } = useLocalSearchParams<{
    documentId: string;
    title?: string;
    role?: string;
  }>();
  const normalizedDocumentId = Array.isArray(documentId) ? documentId[0] : documentId;
  const normalizedTitle = Array.isArray(title) ? title[0] : title;
  const normalizedRole = Array.isArray(role) ? role[0] : role;
  const documentQuery = useDocument(normalizedDocumentId);
  const versionHistoryQuery = useDocumentVersions(normalizedDocumentId);
  const document = documentQuery.data as DocumentDetailsDocument | undefined;
  const { pdfUri, versionHistory } = useDocumentFileVersion({
    document,
    versions: versionHistoryQuery.data?.versions,
  });
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_DOCUMENT_HEADER_HEIGHT);

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
  }, []);

  const handleOpenVersion = useCallback(async (version: VersionHistoryItem) => {
    const versionDocumentId = version.documentId ?? version.id;

    if (!versionDocumentId) {
      return;
    }

    try {
      let versionUri = version.uri ?? undefined;
      let versionTitle = version.fileName ?? version.label;

      if (version.isCurrent && document) {
        versionUri = versionUri ?? pdfUri;
        versionTitle = document.file_name;
      }

      if (!versionUri) {
        const versionDocument = await queryClient.fetchQuery({
          queryKey: queryKeys.documents.detail(versionDocumentId),
          queryFn: () => documentsApi.getById(versionDocumentId),
        });

        versionUri = getDocumentPdfUri(versionDocument);
        versionTitle = versionDocument.file_name;
      }

      router.push({
        pathname: './pdf-viewer',
        params: {
          documentId: versionDocumentId,
          title: version.isCurrent ? `${versionTitle} (Current)` : versionTitle,
          uri: versionUri,
          role: normalizedRole ?? 'viewer',
        },
      });
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  }, [document, normalizedRole, pdfUri, queryClient, router]);

  const isLoading = documentQuery.isLoading || versionHistoryQuery.isLoading;
  const error = documentQuery.error ?? versionHistoryQuery.error;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="VERSION HISTORY"
          title="Document versions"
          subtitle={normalizedTitle ?? 'All uploaded versions for this document.'}
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
          {isLoading ? <LoadingState message="Loading version history..." /> : null}

          {!isLoading && error ? (
            <ErrorState
              title="Unable to load version history"
              message={parseApiError(error).message}
              onRetry={() => {
                void documentQuery.refetch();
                void versionHistoryQuery.refetch();
              }}
            />
          ) : null}

          {!isLoading && !error && versionHistory.length === 0 ? (
            <EmptyState title="No version history yet" />
          ) : null}

          {!isLoading && !error && versionHistory.length > 0 ? (
            <VersionHistoryCard
              items={versionHistory}
              onPressVersion={handleOpenVersion}
              showAll
            />
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
