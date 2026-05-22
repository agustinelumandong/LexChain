import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, ScreenHeader } from '@/ui';
import {
  useAddDocumentParty,
  useAskDocument,
  useDocument,
  useDocumentParties,
  useDocumentVersions,
  useNotarizeDocument,
  useRenameDocument,
  useRemoveDocumentParty,
  useUserProfile,
  useUserSearch,
  useVerifyOnChainDocument,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';
import botQuestionMarkImage from '@/assets/images/lexchain-bot-question-mark.png';
import { canRoleUploadDocuments } from '@/features/profile';

import { HEADER_CONTENT_GAP } from '../constants/document-details.constants';
import { DocumentDetailsContent } from '../components/details/document-details-content';
import { DocumentDetailsSheets } from '../components/details/document-details-sheets';
import { useDocumentDetailsSheets } from '../hooks/use-document-details-sheets';
import { useDocumentFileVersion } from '../hooks/use-document-file-version';
import { useDocumentWhitelistActions } from '../hooks/use-document-whitelist-actions';
import type { DocumentDetailsDocument } from '../types/document-details.types';
import {
  formatEntities,
  formatRiskFlags,
} from '../utils/document-details-formatters';

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const versionHistoryQuery = useDocumentVersions(documentId);
  const partiesQuery = useDocumentParties(documentId);
  const renameMutation = useRenameDocument();
  const notarizeMutation = useNotarizeDocument();
  const addPartyMutation = useAddDocumentParty();
  const removePartyMutation = useRemoveDocumentParty();
  const document = documentQuery.data as DocumentDetailsDocument | undefined;
  const userProfileQuery = useUserProfile();

  const [headerHeight, setHeaderHeight] = useState(126);
  const sheets = useDocumentDetailsSheets();
  const trimmedWhitelistSearchQuery = sheets.whitelistSearchQuery.trim();
  const userSearchQuery = useUserSearch(
    trimmedWhitelistSearchQuery,
    sheets.isWhitelistSheetVisible && trimmedWhitelistSearchQuery.length >= 3,
  );
  const qaMutation = useAskDocument();
  const { mutate: askDocument } = qaMutation;
  const canManageWhitelist = canRoleUploadDocuments(userProfileQuery.data?.role);
  const canUseDocumentAssistant = Boolean(documentId);
  const currentDocumentRole = canManageWhitelist ? 'owner' : 'viewer';
  const isViewer = currentDocumentRole === 'viewer';
  const isAnchored = Boolean(document?.on_chain);
  const onChainQuery = useVerifyOnChainDocument(documentId, isAnchored);
  const canNotarizeDocument =
    canManageWhitelist && document?.status === 'COMPLETED' && !isAnchored;
  const { pdfUri, versionHistory } = useDocumentFileVersion({
    document,
    versions: versionHistoryQuery.data?.versions,
  });
  const { handleAddWhitelistResult, handleRevokeWhitelistGrant, whitelistData } =
    useDocumentWhitelistActions({
      addPartyMutation,
      documentId,
      onSearchQueryReset: () => sheets.setWhitelistSearchQuery(''),
      parties: partiesQuery.data?.parties,
      removePartyMutation,
      userSearchData: userSearchQuery.data,
    });

  const handleRename = async (newName: string) => {
    try {
      await renameMutation.mutateAsync({ documentId, fileName: newName });
      sheets.setIsRenameSheetVisible(false);
      toast.success('Document renamed successfully');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleAsk = useCallback((question: string) => {
    askDocument({ documentId, question });
  }, [askDocument, documentId]);

  const handleNotarize = async () => {
    try {
      await notarizeMutation.mutateAsync(documentId);
      toast.success('Document anchored to blockchain');
      router.push(`/verify/${documentId}`);
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
          rightIconName={isViewer ? undefined : 'menu'}
          rightAccessibilityLabel={isViewer ? undefined : 'Open document menu'}
          onPressLeft={() => router.back()}
          onPressRight={isViewer ? undefined : () => {
            router.push({
              pathname: '/document/menu',
              params: {
                documentId,
                title: document?.file_name ?? 'Document details',
              },
            });
          }}
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
          <DocumentDetailsContent
            allowedCount={whitelistData.grants.length}
            anchoredAt={onChainQuery.data?.onchain_timestamp}
            canManageWhitelist={canManageWhitelist}
            canNotarizeDocument={canNotarizeDocument}
            document={document}
            errorMessage={
              documentQuery.error ? parseApiError(documentQuery.error).message : undefined
            }
            extractedSections={extractedSections}
            isAnchorTimeLoading={isAnchored && onChainQuery.isLoading}
            isLoading={documentQuery.isLoading}
            isNotarizing={notarizeMutation.isPending}
            isViewer={isViewer}
            partyNames={whitelistData.grants.map((grant) => grant.name)}
            riskSections={riskSections}
            versionHistory={versionHistory}
            onPressManageWhitelist={() => sheets.setIsWhitelistSheetVisible(true)}
            onPressNotarize={handleNotarize}
            onPressPdf={() => {
              if (!document || !pdfUri) {
                return;
              }

              router.push({
                pathname: './pdf-viewer',
                params: {
                  documentId: document.document_id,
                  title: document.file_name,
                  uri: pdfUri,
                  role: currentDocumentRole,
                },
              });
            }}
            onPressSearch={() => sheets.setIsSearchSheetVisible(true)}
            onRetry={() => {
              void documentQuery.refetch();
            }}
          />
        </ScrollView>

        {canUseDocumentAssistant ? (
          <LinearGradient
            colors={[
              'rgba(243, 248, 255, 0)',
              APP_COLORS.borderSoft,
            ]}
            pointerEvents="box-none"
            style={styles.footer}
          >
            <Button
              imageSource={botQuestionMarkImage}
              size="md"
              accessibilityLabel="Bot"
              imageSize={32}
              fullRound
              hugWidth
              onPress={() => sheets.setIsAskSheetVisible(true)}
            />
          </LinearGradient>
        ) : null}
      </View>

      <DocumentDetailsSheets
        askAnswer={qaMutation.data?.answer}
        askErrorMessage={
          qaMutation.isError ? parseApiError(qaMutation.error).message : undefined
        }
        currentName={document?.file_name ?? ''}
        documentId={documentId}
        documentTitle={document?.file_name ?? 'this document'}
        isAddPartyPending={addPartyMutation.isPending}
        isAskLoading={qaMutation.isPending}
        isAskSheetVisible={canUseDocumentAssistant && sheets.isAskSheetVisible}
        isPartiesLoading={partiesQuery.isLoading}
        isRemovePartyPending={removePartyMutation.isPending}
        isRenameLoading={renameMutation.isPending}
        isRenameSheetVisible={sheets.isRenameSheetVisible}
        isSearchSheetVisible={sheets.isSearchSheetVisible}
        isUserSearchFetching={userSearchQuery.isFetching}
        isWhitelistSheetVisible={sheets.isWhitelistSheetVisible}
        searchQuery={sheets.whitelistSearchQuery}
        whitelistData={whitelistData}
        onAsk={handleAsk}
        onChangeSearchQuery={sheets.setWhitelistSearchQuery}
        onCloseAsk={() => sheets.setIsAskSheetVisible(false)}
        onCloseRename={() => sheets.setIsRenameSheetVisible(false)}
        onCloseSearch={() => sheets.setIsSearchSheetVisible(false)}
        onCloseWhitelist={() => {
          sheets.setIsWhitelistSheetVisible(false);
          sheets.setWhitelistSearchQuery('');
        }}
        onPressAddResult={handleAddWhitelistResult}
        onPressRevoke={handleRevokeWhitelistGrant}
        onPressSearchMatch={(chunkId) => {
          toast(`Section: ${chunkId}`);
        }}
        onRename={handleRename}
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
});
