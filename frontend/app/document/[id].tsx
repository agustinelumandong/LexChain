import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  AskDocumentCard,
  DetailSectionsCard,
  DocumentScreenHeader,
  DocumentSearchBar,
  DocumentSummaryCard,
  DocumentTopBar,
  RenameDocumentSheet,
  SearchResultsCard,
} from '@/features/document';
import { Button, ErrorState, LoadingState } from '@/ui';
import {
  useAskDocument,
  useDocument,
  useRenameDocument,
  useSearchDocument,
} from '@/services/query';
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
  const renameMutation = useRenameDocument();
  const document = documentQuery.data;

  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useSearchDocument(
    hasSearched ? documentId : '',
    hasSearched ? searchQuery : '',
  );

  const qaMutation = useAskDocument();

  const handleRename = async (newName: string) => {
    try {
      await renameMutation.mutateAsync({ documentId, fileName: newName });
      setIsRenameSheetVisible(false);
      toast.success('Document renamed successfully');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim().length === 0) return;
    setHasSearched(true);
  };

  const handleAsk = (question: string) => {
    qaMutation.mutate({ documentId, question });
  };

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
            rightIconName="edit"
            onPressBack={() => router.back()}
            onPressRight={() => setIsRenameSheetVisible(true)}
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

              <DocumentSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmit={handleSearch}
                isLoading={searchMutation.isPending}
              />

              {searchMutation.data && (
                <SearchResultsCard
                  hits={searchMutation.data.results}
                  onPressHit={(chunkId) => {
                    toast(`Chunk: ${chunkId}`);
                  }}
                />
              )}

              {searchMutation.isError && (
                <ErrorState
                  title="Search failed"
                  message={parseApiError(searchMutation.error).message}
                  onRetry={() => {
                    void searchMutation.refetch();
                  }}
                />
              )}

              <AskDocumentCard
                answer={qaMutation.data?.answer}
                model={qaMutation.data?.model}
                citations={qaMutation.data?.citations}
                isLoading={qaMutation.isPending}
                onAsk={handleAsk}
              />

              {qaMutation.isError && (
                <ErrorState
                  title="Question failed"
                  message={parseApiError(qaMutation.error).message}
                />
              )}

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

      <RenameDocumentSheet
        visible={isRenameSheetVisible}
        currentName={document?.file_name ?? ''}
        onClose={() => setIsRenameSheetVisible(false)}
        onRename={handleRename}
        isLoading={renameMutation.isPending}
      />
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
