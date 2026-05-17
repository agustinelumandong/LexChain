import React, { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  ManageWhitelistBottomSheet,
  RenameDocumentSheet,
} from '@/features/document';
import { ScreenHeader } from '@/ui';
import {
  useAddDocumentParty,
  useDocumentParties,
  useRenameDocument,
  useRemoveDocumentParty,
  useUserSearch,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';

import { HEADER_CONTENT_GAP } from '../constants/document-details.constants';
import { DocumentMenuRow } from '../components/details/document-menu-row';
import { UpdateDocumentSheet } from '../components/details/update-document-sheet';
import { useDocumentVersionUpdate } from '../hooks/use-document-version-update';
import { useDocumentWhitelistActions } from '../hooks/use-document-whitelist-actions';
import { getStringParam } from '../utils/document-file';

export default function DocumentMenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    documentId?: string;
    title?: string;
  }>();
  const documentId = getStringParam(params.documentId);
  const title = getStringParam(params.title) ?? 'Document';
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
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
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
            styles.scrollContent,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <DocumentMenuRow
              iconName="edit"
              title="Rename"
              description="Change the document display name."
              onPress={() => setIsRenameSheetVisible(true)}
            />
            <View style={styles.separator} />
            <DocumentMenuRow
              iconName="upload-file"
              title="Update document"
              description="Select a new PDF, review it, then upload."
              onPress={() => setIsUpdateSheetVisible(true)}
            />
            <View style={styles.separator} />
            <DocumentMenuRow
              iconName="groups"
              title="Manage access"
              description="Configure viewers, signers, and editors."
              onPress={() => setIsAccessSheetVisible(true)}
            />
          </View>
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
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  separator: {
    height: 1,
    marginLeft: 72,
    backgroundColor: APP_COLORS.borderSoft,
  },
});
