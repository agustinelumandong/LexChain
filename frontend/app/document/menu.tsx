import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  ManageWhitelistBottomSheet,
  RenameDocumentSheet,
  mapPartiesToWhitelistData,
  mapUserSearchToWhitelistResult,
} from '@/features/document';
import { Button, ScreenHeader } from '@/ui';
import {
  useAddDocumentParty,
  useDocumentParties,
  useRenameDocument,
  useRemoveDocumentParty,
  useUpdateDocumentVersion,
  useUserSearch,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import type { DocumentPartyRole, PickedUploadFile } from '@/types';
import { APP_COLORS, fonts } from '@/theme';

const HEADER_CONTENT_GAP = 12;

type MenuRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  onPress: () => void;
};

type UpdateDocumentSheetProps = {
  visible: boolean;
  selectedFile: PickedUploadFile | null;
  isLoading: boolean;
  onClose: () => void;
  onPickFile: () => void;
  onUpload: () => void;
};

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  const mimeType = file.mimeType?.toLowerCase();
  return mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function MenuRow({ iconName, title, description, onPress }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>
        <MaterialIcons name={iconName} size={20} color={APP_COLORS.primary} />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={APP_COLORS.textMuted} />
    </Pressable>
  );
}

function UpdateDocumentSheet({
  visible,
  selectedFile,
  isLoading,
  onClose,
  onPickFile,
  onUpload,
}: UpdateDocumentSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ['55%', '80%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  useEffect(() => {
    if (!isLoading) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 950,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isLoading, progressAnim]);

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 220],
  });

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.updateSheetContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Update document</Text>
          <Text style={styles.sheetSubtitle}>
            Select a replacement PDF, then confirm upload when ready.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.filePickerCard, pressed && styles.menuRowPressed]}
          onPress={onPickFile}
          disabled={isLoading}
        >
          <View style={styles.filePickerIcon}>
            <MaterialIcons name="picture-as-pdf" size={24} color={APP_COLORS.primary} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.filePickerTitle}>
              {selectedFile ? selectedFile.name : 'Choose PDF file'}
            </Text>
            <Text style={styles.filePickerDescription}>
              {selectedFile?.sizeLabel ?? 'No file selected yet'}
            </Text>
          </View>
          <MaterialIcons name="upload-file" size={22} color={APP_COLORS.textMuted} />
        </Pressable>

        {isLoading ? (
          <View style={styles.uploadProgressCard}>
            <Text style={styles.uploadProgressLabel}>Updating document...</Text>
            <View style={styles.uploadProgressTrack}>
              <Animated.View
                style={[
                  styles.uploadProgressFill,
                  { transform: [{ translateX: progressTranslateX }] },
                ]}
              />
            </View>
          </View>
        ) : null}

        <Button
          label={isLoading ? 'Updating document...' : 'Upload update'}
          fullWidth
          loading={isLoading}
          disabled={!selectedFile || isLoading}
          leftIconName="upload-file"
          onPress={onUpload}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

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
  const [selectedUpdateFile, setSelectedUpdateFile] = useState<PickedUploadFile | null>(null);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');

  const renameMutation = useRenameDocument();
  const updateVersionMutation = useUpdateDocumentVersion();
  const partiesQuery = useDocumentParties(documentId);
  const addPartyMutation = useAddDocumentParty();
  const removePartyMutation = useRemoveDocumentParty();
  const trimmedWhitelistSearchQuery = whitelistSearchQuery.trim();
  const userSearchQuery = useUserSearch(
    trimmedWhitelistSearchQuery,
    isAccessSheetVisible && trimmedWhitelistSearchQuery.length >= 3,
  );

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

  const handlePickUpdateFile = useCallback(async () => {
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

    setSelectedUpdateFile(selectedFile);
  }, []);

  const handleUploadUpdate = useCallback(async () => {
    if (!documentId || !selectedUpdateFile) {
      return;
    }

    try {
      const response = await updateVersionMutation.mutateAsync({
        documentId,
        file: selectedUpdateFile,
        fileName: selectedUpdateFile.name,
      });
      toast.success(response.message || 'Document update accepted for processing');
      setSelectedUpdateFile(null);
      setIsUpdateSheetVisible(false);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  }, [documentId, selectedUpdateFile, updateVersionMutation]);

  const handleAddWhitelistResult = useCallback(
    async (resultId: string, role: DocumentPartyRole) => {
      if (!documentId) {
        return;
      }

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
            role,
          },
        });
        setWhitelistSearchQuery('');
        toast.success(`${result.name} added as ${role}`);
      } catch (error) {
        toast.error(parseApiError(error).message);
      }
    },
    [addPartyMutation, documentId, whitelistData.searchResults],
  );

  const handleRevokeWhitelistGrant = useCallback(
    async (partyUserId: string) => {
      if (!documentId) {
        return;
      }

      try {
        await removePartyMutation.mutateAsync({ documentId, partyUserId });
        toast.success('User removed from document access');
      } catch (error) {
        toast.error(parseApiError(error).message);
      }
    },
    [documentId, removePartyMutation],
  );

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
            <MenuRow
              iconName="edit"
              title="Rename"
              description="Change the document display name."
              onPress={() => setIsRenameSheetVisible(true)}
            />
            <View style={styles.separator} />
            <MenuRow
              iconName="upload-file"
              title="Update document"
              description="Select a new PDF, review it, then upload."
              onPress={() => setIsUpdateSheetVisible(true)}
            />
            <View style={styles.separator} />
            <MenuRow
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
        isLoading={updateVersionMutation.isPending}
        onClose={() => {
          setIsUpdateSheetVisible(false);
          if (!updateVersionMutation.isPending) {
            setSelectedUpdateFile(null);
          }
        }}
        onPickFile={handlePickUpdateFile}
        onUpload={handleUploadUpdate}
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
  menuRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuRowPressed: {
    opacity: 0.72,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  rowDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginLeft: 72,
    backgroundColor: APP_COLORS.borderSoft,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: APP_COLORS.bg,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  handleIndicator: {
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: APP_COLORS.borderSoft,
  },
  updateSheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 18,
  },
  sheetHeader: {
    gap: 8,
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  filePickerCard: {
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  filePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  filePickerDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  uploadProgressCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  uploadProgressLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  uploadProgressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.borderSoft,
  },
  uploadProgressFill: {
    width: '42%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
  },
});
