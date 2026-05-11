import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  AskDocumentSheet,
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

import { APP_COLORS, fonts } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

type VersionHistoryItem = {
  id: string;
  date: string;
  label: string;
  statusLabel?: string;
  description: string;
  isCurrent?: boolean;
};

type DetailBodyBlock =
  | {
      kind: 'group';
      title: string;
      values: string[];
    }
  | {
      kind: 'risk';
      severity?: string;
      text: string;
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

function formatContentType(value: string) {
  if (value === 'application/pdf') {
    return 'PDF';
  }

  return value.split('/').pop()?.toUpperCase() ?? value;
}

function getRecordText(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  ORG: 'Organizations',
  PERSON: 'People',
  DATE: 'Dates',
  URL: 'Links',
  DOCUMENT_NUMBER: 'Document numbers',
  LOCATION: 'Locations',
};

function formatEntities(entities?: Record<string, unknown>[]): DetailBodyBlock[] {
  if (!entities?.length) {
    return [
      {
        kind: 'group',
        title: 'Extracted details',
        values: ['No extracted information yet'],
      },
    ];
  }

  const grouped = entities.reduce<Record<string, string[]>>((groups, entity) => {
    const rawType = getRecordText(entity, 'type');
    const label = ENTITY_TYPE_LABELS[rawType] ?? 'Other details';
    const value = getRecordText(entity, 'value');

    if (!value) {
      return groups;
    }

    return {
      ...groups,
      [label]: [...(groups[label] ?? []), value],
    };
  }, {});

  const blocks = Object.entries(grouped)
    .map(([label, values]) => {
      const uniqueValues = [...new Set(values)];
      return {
        kind: 'group' as const,
        title: label,
        values: uniqueValues,
      };
    });

  return blocks.length
    ? blocks
    : [
        {
          kind: 'group',
          title: 'Extracted details',
          values: ['No extracted information yet'],
        },
      ];
}

function formatRiskFlags(riskFlags?: Record<string, unknown>[]): DetailBodyBlock[] {
  if (!riskFlags?.length) {
    return [
      {
        kind: 'risk',
        text: 'No risk flags found',
      },
    ];
  }

  return riskFlags
    .map((riskFlag) => {
      const clause = getRecordText(riskFlag, 'clause') || 'Potential issue detected';
      const severity = getRecordText(riskFlag, 'severity');

      return {
        kind: 'risk' as const,
        severity: severity ? `${severity.toUpperCase()} RISK` : undefined,
        text: clause,
      };
    });
}

function buildVersionHistory({
  createdAt,
  status,
}: {
  createdAt: string;
  status: string;
}): VersionHistoryItem[] {
  return [
    {
      id: 'original',
      date: formatDate(createdAt),
      label: 'Original upload',
      description: 'First version captured in LexChain for processing and review.',
    },
    {
      id: 'current',
      date: 'Current',
      label: 'Current version',
      statusLabel: status,
      description: 'Active document version used for search, summaries, and access review.',
      isCurrent: true,
    },
  ];
}

function VersionHistoryCard({ items }: { items: VersionHistoryItem[] }) {
  return (
    <View style={styles.versionCard}>
      <View style={styles.versionHeader}>
        <Text style={styles.versionEyebrow}>VERSION HISTORY</Text>
        <Text style={styles.versionTitle}>Document updates</Text>
      </View>

      <View style={styles.timeline}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineDateColumn}>
                <Text
                  style={[
                    styles.timelineDate,
                    item.isCurrent && styles.timelineDateCurrent,
                  ]}
                >
                  {item.date}
                </Text>
              </View>

              <View style={styles.timelineLineColumn}>
                <View
                  style={[
                    styles.timelineDot,
                    item.isCurrent && styles.timelineDotCurrent,
                  ]}
                />
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      item.isCurrent && styles.timelineLabelCurrent,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.statusLabel ? (
                    <Text style={styles.versionStatus}>{item.statusLabel}</Text>
                  ) : null}
                </View>
                <Text style={styles.timelineDescription}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DocumentStatusCard({
  status,
  uploadedAt,
}: {
  status: string;
  uploadedAt: string;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusCopy}>
        <Text style={styles.statusEyebrow}>STATUS</Text>
        <Text style={styles.statusTitle}>Verification state</Text>
        <Text style={styles.statusBody}>Last updated {formatDate(uploadedAt)}</Text>
      </View>

      <Text style={styles.statusPill}>{status}</Text>
    </View>
  );
}

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const renameMutation = useRenameDocument();
  const document = documentQuery.data;

  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [isAskSheetVisible, setIsAskSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useSearchDocument(
    hasSearched ? documentId : '',
    hasSearched ? searchQuery : '',
  );

  const qaMutation = useAskDocument();
  const { mutate: askDocument } = qaMutation;

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

  const handleAsk = useCallback((question: string) => {
    askDocument({ documentId, question });
  }, [askDocument, documentId]);

  const riskSections = useMemo(() => {
    if (!document) {
      return [];
    }

    return [
      {
        title: 'Risk review',
        bodyBlocks: formatRiskFlags(document.risk_flags),
      },
    ];
  }, [document]);

  const extractedSections = useMemo(() => {
    if (!document) {
      return [];
    }

    return [
      {
        title: 'Extracted information',
        bodyBlocks: formatEntities(document.entities),
      },
    ];
  }, [document]);

  const versionHistory = useMemo(() => {
    if (!document) {
      return [];
    }

    return buildVersionHistory({
      createdAt: document.created_at,
      status: document.status,
    });
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
            description="AI summary, verification status, ownership history, risk review, and searchable details."
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
                title="Document summary"
                rows={[
                  { label: 'Reference', value: document.document_id },
                  { label: 'Type', value: formatContentType(document.content_type) },
                  { label: 'Uploaded', value: formatDate(document.created_at) },
                ]}
                summary={document.summary ?? 'Summary is not ready yet.'}
              />

              <DocumentStatusCard
                status={document.status}
                uploadedAt={document.created_at}
              />

              <VersionHistoryCard items={versionHistory} />

              <DetailSectionsCard sections={riskSections} />

              <DetailSectionsCard sections={extractedSections} />

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
            </>
          ) : (
            <ErrorState title="Document not found" message="No document data returned." />
          )}
        </ScrollView>

        <LinearGradient
          colors={[
            'rgba(243, 248, 255, 0)',
            APP_COLORS.borderSoft,
          ]}
          pointerEvents="box-none"
          style={styles.footer}
        >
          <Button
            imageSource={require('@/../assets/images/lexchain-bot-question-mark.png')}
            size="md"
            accessibilityLabel="Bot"
            imageSize={32}
            fullRound
            hugWidth
            onPress={() => setIsAskSheetVisible(true)}
          />
        </LinearGradient>
      </View>

      <RenameDocumentSheet
        visible={isRenameSheetVisible}
        currentName={document?.file_name ?? ''}
        onClose={() => setIsRenameSheetVisible(false)}
        onRename={handleRename}
        isLoading={renameMutation.isPending}
      />

      <AskDocumentSheet
        visible={isAskSheetVisible}
        documentTitle={document?.file_name ?? 'this document'}
        answer={qaMutation.data?.answer}
        isLoading={qaMutation.isPending}
        errorMessage={
          qaMutation.isError ? parseApiError(qaMutation.error).message : undefined
        }
        onClose={() => setIsAskSheetVisible(false)}
        onAsk={handleAsk}
      />
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 112,
    gap: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 24,
  },
  statusCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusCopy: {
    flex: 1,
    gap: 4,
  },
  statusEyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
  statusBody: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  statusPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  versionCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 18,
    gap: 18,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  versionHeader: {
    gap: 4,
  },
  versionEyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  versionTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  timelineDateColumn: {
    width: 82,
    paddingTop: 1,
  },
  timelineDate: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  timelineDateCurrent: {
    color: APP_COLORS.primary,
  },
  timelineLineColumn: {
    alignItems: 'center',
    width: 18,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: APP_COLORS.borderSoft,
    borderWidth: 3,
    borderColor: APP_COLORS.white,
  },
  timelineDotCurrent: {
    backgroundColor: APP_COLORS.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 52,
    backgroundColor: APP_COLORS.borderSoft,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
    gap: 6,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timelineLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  timelineLabelCurrent: {
    color: APP_COLORS.primary,
  },
  versionStatus: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timelineDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
