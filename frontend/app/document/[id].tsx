import React, { useCallback, useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  AskDocumentSheet,
  DetailSectionsCard,
  DocumentSummaryCard,
  ManageWhitelistBottomSheet,
  mapPartiesToWhitelistData,
  mapUserSearchToWhitelistResult,
  RenameDocumentSheet,
  SearchDocumentSheet,
} from '@/features/document';
import { Button, ErrorState, ScreenHeader, SkeletonBox } from '@/ui';
import type { PickedUploadFile } from '@/types';
import {
  useAddDocumentParty,
  useAskDocument,
  useDocument,
  useDocumentParties,
  useDocumentVersions,
  useNotarizeDocument,
  useRenameDocument,
  useRemoveDocumentParty,
  useUpdateDocumentVersion,
  useUserSearch,
} from '@/services/query';
import { useCloseSheetOnBack } from '@/hooks';
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

const TEST_PDF_URI = 'https://www.deped.gov.ph/wp-content/uploads/2017/08/DO_s2017_042-1.pdf';
const HEADER_CONTENT_GAP = 12;

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

function formatReference(value: string) {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

function formatFileSize(fileSize?: number | null) {
  if (!fileSize || Number.isNaN(fileSize)) {
    return undefined;
  }

  if (fileSize >= 1024 * 1024) {
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

function isPdfFile(file: PickedUploadFile) {
  return file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function getDocumentPdfUri(document: {
  storage_url?: string | null;
  file_uri?: string | null;
  file_url?: string | null;
  pdf_url?: string | null;
}) {
  return (
    document.pdf_url ??
    document.file_url ??
    document.file_uri ??
    document.storage_url ??
    TEST_PDF_URI
  );
}

function formatStatusLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
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
  DOCUMENT_NUMBER: 'Document No.',
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
      date: formatDate(createdAt),
      label: 'Current version',
      statusLabel: formatStatusLabel(status),
      description: 'Active document version used for search, summaries, and access review.',
      isCurrent: true,
    },
  ];
}

function mapApiVersionHistory(
  versions: {
    document_id: string;
    file_name: string;
    status: string;
    is_latest: boolean;
    created_at: string;
  }[] = [],
): VersionHistoryItem[] {
  return versions.map((version) => ({
    id: version.document_id,
    date: formatDate(version.created_at),
    label: version.is_latest ? 'Current version' : version.file_name,
    statusLabel: formatStatusLabel(version.status),
    description: version.is_latest
      ? 'Active document version used for search, summaries, and access review.'
      : 'Previous document version kept in the version history.',
    isCurrent: version.is_latest,
  }));
}

function VersionHistoryCard({ items }: { items: VersionHistoryItem[] }) {
  return (
    <View style={styles.versionCard}>
      <View style={styles.versionHeader}>
        <View style={styles.cardIconBubble}>
          <MaterialIcons name="history" size={24} color={APP_COLORS.primary} />
        </View>
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
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified-user" size={24} color={APP_COLORS.primary} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Verification</Text>
        <Text style={styles.statusBody}>Last updated {formatDate(uploadedAt)}</Text>
      </View>

      <Text style={styles.statusPill}>{formatStatusLabel(status)}</Text>
    </View>
  );
}

function formatWhitelistCountLabel(count: number) {
  return `${count} allowed user${count === 1 ? '' : 's'}`;
}

function AccessControlCard({
  allowedCountLabel,
  canManageWhitelist,
  onPressManage,
}: {
  allowedCountLabel: string;
  canManageWhitelist: boolean;
  onPressManage: () => void;
}) {
  return (
    <View style={styles.accessCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="shield" size={24} color={APP_COLORS.primary} />
      </View>

      <View style={styles.accessCopy}>
        <Text style={styles.statusTitle}>Access control</Text>
        <Text style={styles.statusBody}>
          {canManageWhitelist
            ? 'Manage who can view or verify this document.'
            : 'Whitelist access is managed by the document issuer.'}
        </Text>
        <Text style={styles.accessCount}>{allowedCountLabel}</Text>
      </View>

      {canManageWhitelist ? (
        <View style={styles.accessAction}>
          <Button
            label="Manage"
            variant="secondary"
            size="sm"
            onPress={onPressManage}
          />
        </View>
      ) : null}
    </View>
  );
}

function ConfidenceCard({ isReady }: { isReady: boolean }) {
  return (
    <View style={styles.confidenceCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified" size={24} color={APP_COLORS.primary} />
      </View>
      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Summary confidence</Text>
        <Text style={styles.statusBody}>AI-generated summary reliability</Text>
      </View>
      <Text style={styles.confidencePill}>{isReady ? 'High' : 'Pending'}</Text>
    </View>
  );
}

function DocumentDetailsSkeleton() {
  return (
    <>
      <View style={styles.skeletonActionRow}>
        <SkeletonBox height={40} borderRadius={999} style={styles.skeletonAction} />
        <SkeletonBox height={40} borderRadius={999} style={styles.skeletonAction} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="52%" height={18} borderRadius={999} />
        <View style={styles.skeletonMetaGrid}>
          <SkeletonBox width="44%" height={14} borderRadius={999} />
          <SkeletonBox width="35%" height={14} borderRadius={999} />
          <SkeletonBox width="48%" height={14} borderRadius={999} />
        </View>
        <SkeletonBox height={14} borderRadius={999} />
        <SkeletonBox width="86%" height={14} borderRadius={999} />
        <SkeletonBox width="64%" height={14} borderRadius={999} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="46%" height={18} borderRadius={999} />
        <SkeletonBox width="72%" height={14} borderRadius={999} />
        <SkeletonBox width={118} height={32} borderRadius={999} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="50%" height={18} borderRadius={999} />
        <SkeletonBox width="76%" height={14} borderRadius={999} />
        <SkeletonBox width="58%" height={14} borderRadius={999} />
      </View>
    </>
  );
}

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const versionHistoryQuery = useDocumentVersions(documentId);
  const partiesQuery = useDocumentParties(documentId);
  const renameMutation = useRenameDocument();
  const updateVersionMutation = useUpdateDocumentVersion();
  const notarizeMutation = useNotarizeDocument();
  const addPartyMutation = useAddDocumentParty();
  const removePartyMutation = useRemoveDocumentParty();
  const document = documentQuery.data;

  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [isAskSheetVisible, setIsAskSheetVisible] = useState(false);
  const [isSearchSheetVisible, setIsSearchSheetVisible] = useState(false);
  const [isWhitelistSheetVisible, setIsWhitelistSheetVisible] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const [headerHeight, setHeaderHeight] = useState(126);
  const trimmedWhitelistSearchQuery = whitelistSearchQuery.trim();
  const userSearchQuery = useUserSearch(
    trimmedWhitelistSearchQuery,
    isWhitelistSheetVisible && trimmedWhitelistSearchQuery.length >= 3,
  );

  const qaMutation = useAskDocument();
  const { mutate: askDocument } = qaMutation;
  const isAnySheetVisible =
    isRenameSheetVisible ||
    isAskSheetVisible ||
    isSearchSheetVisible ||
    isWhitelistSheetVisible;

  const closeVisibleSheet = useCallback(() => {
    if (isAskSheetVisible) {
      setIsAskSheetVisible(false);
      return;
    }

    if (isSearchSheetVisible) {
      setIsSearchSheetVisible(false);
      return;
    }

    if (isWhitelistSheetVisible) {
      setIsWhitelistSheetVisible(false);
      setWhitelistSearchQuery('');
      return;
    }

    if (isRenameSheetVisible) {
      setIsRenameSheetVisible(false);
    }
  }, [
    isAskSheetVisible,
    isRenameSheetVisible,
    isSearchSheetVisible,
    isWhitelistSheetVisible,
  ]);

  useCloseSheetOnBack(isAnySheetVisible, closeVisibleSheet);

  const handleRename = async (newName: string) => {
    try {
      await renameMutation.mutateAsync({ documentId, fileName: newName });
      setIsRenameSheetVisible(false);
      toast.success('Document renamed successfully');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleAsk = useCallback((question: string) => {
    askDocument({ documentId, question });
  }, [askDocument, documentId]);

  const canManageWhitelist = true;
  const currentDocumentRole = canManageWhitelist ? 'owner' : 'viewer';
  const canNotarizeDocument = document?.status === 'COMPLETED';

  const handleChooseVersionFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const selectedFile: PickedUploadFile = {
        id: `${asset.uri}-${Date.now()}`,
        name: asset.name,
        sizeLabel: formatFileSize(asset.size),
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'application/pdf',
        sourceLabel: 'file',
      };

      if (!isPdfFile(selectedFile)) {
        toast.warning('LexChain only accepts PDF documents');
        return;
      }

      const response = await updateVersionMutation.mutateAsync({
        documentId,
        file: selectedFile,
        fileName: selectedFile.name,
      });

      toast.success(response.message || 'Document update accepted for processing');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleNotarize = async () => {
    if (!canNotarizeDocument) {
      toast.warning('Document must be completed before notarization');
      return;
    }

    try {
      await notarizeMutation.mutateAsync(documentId);
      toast.success('Document notarized on-chain');
      router.push(`/verify/${documentId}`);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleAddWhitelistResult = async (resultId: string) => {
    const result = whitelistData.searchResults.find(
      (entry) => entry.id === resultId,
    );

    if (!result) {
      return;
    }

    try {
      await addPartyMutation.mutateAsync({
        documentId,
        payload: {
          email: result.email,
          role: 'viewer',
        },
      });
      setWhitelistSearchQuery('');
      toast.success(`${result.name} added to document access`);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleRevokeWhitelistGrant = async (partyUserId: string) => {
    try {
      await removePartyMutation.mutateAsync({ documentId, partyUserId });
      toast.success('User removed from document access');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

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

    const apiVersions = mapApiVersionHistory(versionHistoryQuery.data?.versions);

    if (apiVersions.length > 0) {
      return apiVersions;
    }

    return buildVersionHistory({
      createdAt: document.created_at,
      status: document.status,
    });
  }, [document, versionHistoryQuery.data?.versions]);

  const whitelistData = useMemo(
    () =>
      mapPartiesToWhitelistData(
        partiesQuery.data?.parties,
        mapUserSearchToWhitelistResult(userSearchQuery.data),
      ),
    [partiesQuery.data?.parties, userSearchQuery.data],
  );

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="DOCUMENT DETAILS"
          title={document?.file_name ?? 'Document details'}
          subtitle="AI summary, verification status, ownership history, risk review, and searchable details."
          leftAccessibilityLabel="Back to documents"
          rightIconName="edit"
          rightAccessibilityLabel="Rename document"
          onPressLeft={() => router.back()}
          onPressRight={() => setIsRenameSheetVisible(true)}
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
          {documentQuery.isLoading ? (
            <DocumentDetailsSkeleton />
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
              <View style={styles.actionRow}>
                <Button
                  label="View PDF"
                  variant="secondary"
                  size="sm"
                  leftIconName="picture-as-pdf"
                  style={styles.actionButton}
                  onPress={() => {
                    router.push({
                      pathname: './pdf-viewer',
                      params: {
                        documentId: document.document_id,
                        title: document.file_name,
                        uri: getDocumentPdfUri(document),
                        role: currentDocumentRole,
                      },
                    });
                  }}
                />
                <Button
                  label="Search within document"
                  variant="secondary"
                  size="sm"
                  leftIconName="search"
                  style={styles.actionButton}
                  onPress={() => setIsSearchSheetVisible(true)}
                />
                <Button
                  label="Update version"
                  variant="secondary"
                  size="sm"
                  leftIconName="upload-file"
                  style={styles.actionButton}
                  loading={updateVersionMutation.isPending}
                  onPress={handleChooseVersionFile}
                />
                <Button
                  label="Notarize"
                  variant="secondary"
                  size="sm"
                  leftIconName="verified"
                  style={styles.actionButton}
                  disabled={!canNotarizeDocument}
                  loading={notarizeMutation.isPending}
                  onPress={handleNotarize}
                />
              </View>

              <DocumentSummaryCard
                title="Document summary"
                rows={[
                  { label: 'Reference', value: formatReference(document.document_id) },
                  { label: 'Type', value: formatContentType(document.content_type) },
                  { label: 'Uploaded', value: formatDate(document.created_at) },
                ]}
                summary={document.summary ?? 'Summary is not ready yet.'}
              />

              <DocumentStatusCard
                status={document.status}
                uploadedAt={document.updated_at}
              />

              <AccessControlCard
                allowedCountLabel={formatWhitelistCountLabel(whitelistData.grants.length)}
                canManageWhitelist={canManageWhitelist}
                onPressManage={() => setIsWhitelistSheetVisible(true)}
              />

              <VersionHistoryCard items={versionHistory} />

              <Text style={styles.insightsEyebrow}>DOCUMENT INSIGHTS</Text>

              <DetailSectionsCard
                sections={riskSections}
                iconName="warning-amber"
                riskHelperText="Why this matters"
              />

              <DetailSectionsCard
                sections={extractedSections}
                iconName="description"
              />

              <ConfidenceCard isReady={Boolean(document.summary)} />
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

      <SearchDocumentSheet
        visible={isSearchSheetVisible}
        documentId={documentId}
        documentTitle={document?.file_name ?? 'this document'}
        onClose={() => setIsSearchSheetVisible(false)}
        onPressMatch={(chunkId) => {
          toast(`Section: ${chunkId}`);
        }}
      />

      <ManageWhitelistBottomSheet
        visible={isWhitelistSheetVisible}
        data={whitelistData}
        searchQuery={whitelistSearchQuery}
        isLoading={
          partiesQuery.isLoading ||
          addPartyMutation.isPending ||
          removePartyMutation.isPending ||
          userSearchQuery.isFetching
        }
        onChangeSearchQuery={setWhitelistSearchQuery}
        onClose={() => {
          setIsWhitelistSheetVisible(false);
          setWhitelistSearchQuery('');
        }}
        onPressGrantAction={() => {}}
        onPressRevoke={handleRevokeWhitelistGrant}
        onPressAddResult={handleAddWhitelistResult}
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
    paddingHorizontal: 16,
    paddingBottom: 128,
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 132,
  },
  skeletonActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skeletonAction: {
    flex: 1,
    minWidth: 132,
  },
  skeletonCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  skeletonMetaGrid: {
    gap: 10,
  },
  insightsEyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  accessCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  accessCopy: {
    flex: 1,
    gap: 4,
  },
  accessCount: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  accessAction: {
    minWidth: 104,
  },
  statusCopy: {
    flex: 1,
    gap: 4,
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
    backgroundColor: '#EAF8F0',
    color: '#0C6B3A',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cardIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    gap: 18,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    backgroundColor: '#EAF8F0',
    color: '#0C6B3A',
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
  confidenceCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confidencePill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
