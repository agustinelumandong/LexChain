import React, { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { ErrorState, ScreenHeader } from '@/ui';
import {
  useAddDocumentParty,
  useDocumentParties,
  useRenameDocument,
  useRemoveDocumentParty,
  useUserProfile,
  useUserSearch,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { canRoleUploadDocuments } from '@/features/profile';
import { HEADER_CONTENT_GAP } from '@/features/document/constants/document-details.constants';
import { ManageWhitelistBottomSheet } from '@/features/document/components/whitelist/manage-whitelist-bottom-sheet';
import { RenameDocumentSheet } from '@/features/document/components/sheets/rename-document-sheet';
import { DocumentMenuActionsCard } from '@/features/document/components/details/document-menu-actions-card';
import { UpdateDocumentSheet } from '@/features/document/components/details/update-document-sheet';
import { useDocumentVersionUpdate } from '@/features/document/hooks/use-document-version-update';
import { useDocumentWhitelistActions } from '@/features/document/hooks/use-document-whitelist-actions';
import { getStringParam } from '@/features/document/utils/document-file';
import { documentMenuScreenStyles } from '@/features/document/screens/document-menu-screen.styles';

export default function DocumentMenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    documentId?: string;
    title?: string;
  }>();
  const documentId = getStringParam(params.documentId);
  const title = getStringParam(params.title) ?? 'Document';
  const userProfileQuery = useUserProfile();
  const canManageDocument = canRoleUploadDocuments(userProfileQuery.data?.role);
  const [headerHeight, setHeaderHeight] = useState(126);
  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [isUpdateSheetVisible, setIsUpdateSheetVisible] = useState(false);
  const [isAccessSheetVisible, setIsAccessSheetVisible] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');

  const renameMutation = useRenameDocument();
  const partiesQuery = useDocumentParties(documentId);
  const addPartyMutation = useAddDocumentParty();
  const removePartyMutation = useRemoveDocumentParty();
  const trimmedWhitelistSearchQuery = whitelistSearchQuery.trim();
  const userSearchQuery = useUserSearch(
    trimmedWhitelistSearchQuery,
    isAccessSheetVisible && trimmedWhitelistSearchQuery.length >= 3,
  );
  const {
    clearSelectedUpdateFile,
    handlePickUpdateFile,
    handleUploadUpdate,
    isUpdatingVersion,
    selectedUpdateFile,
  } = useDocumentVersionUpdate(documentId);
  const { handleAddWhitelistResult, handleRevokeWhitelistGrant, whitelistData } =
    useDocumentWhitelistActions({
      addPartyMutation,
      documentId: documentId ?? '',
      onSearchQueryReset: () => setWhitelistSearchQuery(''),
      parties: partiesQuery.data?.parties,
      removePartyMutation,
      userSearchData: userSearchQuery.data,
    });

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, []);

  const handleRename = useCallback(
    async (newName: string) => {
      if (!documentId) {
        toast.error('Document ID is missing');
        return;
      }

      try {
        await renameMutation.mutateAsync({ documentId, fileName: newName });
        setIsRenameSheetVisible(false);
        toast.success('Document renamed successfully');
      } catch (error) {
        toast.error(parseApiError(error).message);
      }
    },
    [documentId, renameMutation],
  );

  const handleCloseUpdateSheet = useCallback(() => {
    setIsUpdateSheetVisible(false);
    if (!isUpdatingVersion) {
      clearSelectedUpdateFile();
    }
  }, [clearSelectedUpdateFile, isUpdatingVersion]);

  const handleSubmitUpdate = useCallback(async () => {
    const didUpload = await handleUploadUpdate();

    if (didUpload) {
      setIsUpdateSheetVisible(false);
    }
  }, [handleUploadUpdate]);

  return (
    <SafeAreaView style={documentMenuScreenStyles.screen} edges={['left', 'right', 'bottom']}>
      <View style={documentMenuScreenStyles.surface}>
        <ScreenHeader
          eyebrow="DOCUMENT"
          title="Menu"
          subtitle={title}
          leftAccessibilityLabel="Back to document"
          onPressLeft={() => router.back()}
          onHeightChange={handleHeaderHeightChange}
          includeTopInset
        />

        <ScrollView
          contentContainerStyle={[
            documentMenuScreenStyles.scrollContent,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {canManageDocument ? (
            <DocumentMenuActionsCard
              onPressRename={() => setIsRenameSheetVisible(true)}
              onPressUpdate={() => setIsUpdateSheetVisible(true)}
              onPressManageAccess={() => setIsAccessSheetVisible(true)}
            />
          ) : (
            <ErrorState
              title="Document menu unavailable"
              message="Only lawyers can rename, update, anchor, or manage access for documents."
            />
          )}
        </ScrollView>
      </View>

      <RenameDocumentSheet
        visible={isRenameSheetVisible}
        currentName={title}
        onClose={() => setIsRenameSheetVisible(false)}
        onRename={handleRename}
        isLoading={renameMutation.isPending}
      />

      <UpdateDocumentSheet
        visible={isUpdateSheetVisible}
        selectedFile={selectedUpdateFile}
        isLoading={isUpdatingVersion}
        onClose={handleCloseUpdateSheet}
        onPickFile={handlePickUpdateFile}
        onUpload={handleSubmitUpdate}
      />

      <ManageWhitelistBottomSheet
        visible={isAccessSheetVisible}
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
          setIsAccessSheetVisible(false);
          setWhitelistSearchQuery('');
        }}
        onPressGrantAction={() => {}}
        onPressRevoke={handleRevokeWhitelistGrant}
        onPressAddResult={handleAddWhitelistResult}
      />
    </SafeAreaView>
  );
}
