import React, { useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { AccessWhitelistCard, ManageWhitelistBottomSheet } from '@/features/document';
import { useCloseSheetOnBack } from '@/hooks';
import { Button, ScreenHeader } from '@/ui';
import type { ManageWhitelistData, PickedUploadFile } from '@/types';
import {
  createPdfFromImages,
  consumePendingCapturedFiles,
  UploadDropzoneCard,
} from '@/features/upload';
import { useUploadDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import { APP_COLORS } from '@/theme';
const COLORS = {
  bg: APP_COLORS.bg,
  primary: APP_COLORS.primary,
  white: APP_COLORS.white,
  textMuted: APP_COLORS.textMuted,
  navy: APP_COLORS.navy,
  borderSoft: APP_COLORS.borderSoft,
};

const INITIAL_WHITELIST: ManageWhitelistData = {
  grants: [
    {
      id: 'cruz',
      name: 'Atty. Cruz',
      email: 'cruz@lexchain.app',
      accessLabel: 'Verify access',
      actionLabel: 'Verify',
    },
    {
      id: 'juan-d',
      name: 'Juan D.',
      email: 'juan.d@lexchain.app',
      accessLabel: 'View access',
      actionLabel: 'View',
    },
  ],
  searchResults: [
    { id: 'juan-dela-cruz', name: 'Juan Dela Cruz', email: 'juan@lexchain.app' },
    { id: 'juan-santos', name: 'Juan Santos', email: 'owner@lexchain.app' },
  ],
};

const HEADER_CONTENT_GAP = 12;

export default function UploadScreen() {
  const router = useRouter();
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const [whitelistData, setWhitelistData] = useState(INITIAL_WHITELIST);
  const [pickedFiles, setPickedFiles] = useState<PickedUploadFile[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [isPreparingScanPdf, setIsPreparingScanPdf] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(126);
  const uploadMutation = useUploadDocument();

  useFocusEffect(
    React.useCallback(() => {
      const pendingCapturedFiles = consumePendingCapturedFiles();

      if (pendingCapturedFiles.length > 0) {
        setIsPreparingScanPdf(true);

        void createPdfFromImages(pendingCapturedFiles)
          .then((scanPdf) => {
            setPickedFiles([scanPdf]);
            setDocumentTitle((currentTitle) =>
              currentTitle.trim() ? currentTitle : scanPdf.name,
            );
            toast.success(
              pendingCapturedFiles.length === 1
                ? 'Captured page converted to PDF'
                : `${pendingCapturedFiles.length} captured pages converted to PDF`,
            );
          })
          .catch((error) => {
            console.error('Failed to create PDF from captured pages', error);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            toast.error('Failed to convert scan to PDF');
          })
          .finally(() => {
            setIsPreparingScanPdf(false);
          });
      }
    }, []),
  );

  useCloseSheetOnBack(isWhitelistOpen, () => {
    setIsWhitelistOpen(false);
    setWhitelistSearchQuery('');
  });

  const updateWhitelistCountLabel = (count: number) =>
    `${count} allowed wallet${count === 1 ? '' : 's'}/users`;

  const openWhitelist = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWhitelistOpen(true);
  };

  const handleAddWhitelistResult = (resultId: string) => {
    let addedName: string | undefined;

    setWhitelistData((current) => {
      const result = current.searchResults.find((entry) => entry.id === resultId);

      if (!result) {
        return current;
      }

      addedName = result.name;

      return {
        ...current,
        grants: [
          {
            id: result.id,
            name: result.name,
            email: result.email,
            accessLabel: 'View access',
            actionLabel: 'View',
          },
          ...current.grants,
        ],
        searchResults: current.searchResults.filter((entry) => entry.id !== resultId),
      };
    });

    setWhitelistSearchQuery('');

    if (addedName) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(`${addedName} added to upload access`);
    }
  };

  const handleRevokeGrant = (grantId: string) => {
    let revokedName: string | undefined;

    setWhitelistData((current) => {
      const grant = current.grants.find((entry) => entry.id === grantId);

      if (!grant) {
        return current;
      }

      revokedName = grant.name;

      return {
        ...current,
        grants: current.grants.filter((entry) => entry.id !== grantId),
        searchResults:
          grant.email && !current.searchResults.some((entry) => entry.id === grant.id)
            ? [
                {
                  id: grant.id,
                  name: grant.name,
                  email: grant.email,
                },
                ...current.searchResults,
              ]
            : current.searchResults,
      };
    });

    if (revokedName) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(`${revokedName} removed from upload access`);
    }
  };

  const formatFileSize = (fileSize?: number | null) => {
    if (!fileSize || Number.isNaN(fileSize)) {
      return undefined;
    }

    if (fileSize >= 1024 * 1024) {
      return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  };

  const isPdfFile = (file: PickedUploadFile) =>
    file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  const handleChooseFile = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });

      if (result.canceled) {
        return;
      }

      if (!result.assets?.length) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.warning('No files were selected');
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
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.warning('LexChain only accepts PDF documents');
        return;
      }

      setPickedFiles([selectedFile]);
      setDocumentTitle((currentTitle) =>
        currentTitle.trim() ? currentTitle : selectedFile.name,
      );

      toast.success('PDF ready to upload');
    } catch (error) {
      console.error('Failed to choose upload file', error);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to choose file');
    }
  };

  const handleOpenCameraCapture = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/camera-capture');
  };

  const handlePreviewFile = (file: PickedUploadFile) => {
    if (!isPdfFile(file)) {
      toast.warning('Only PDF documents can be previewed');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/document/pdf-viewer',
      params: {
        documentId: file.id,
        title: documentTitle.trim() || file.name,
        uri: file.uri,
        role: 'owner',
      },
    });
  };

  const handleShareFile = async (file: PickedUploadFile) => {
    if (!isPdfFile(file)) {
      toast.warning('Only PDF documents can be saved');
      return;
    }

    const isSharingAvailable = await Sharing.isAvailableAsync();

    if (!isSharingAvailable) {
      toast.error('Saving this PDF is not available on this device');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save scanned PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Failed to share upload PDF', error);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to open save options');
    }
  };

  const handleContinueToProcessing = async () => {
    if (pickedFiles.length === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Choose a PDF or scan pages first');
      return;
    }

    if (!isPdfFile(pickedFiles[0])) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Final document must be a PDF');
      return;
    }

    if (!documentTitle.trim()) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Enter a document title');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await uploadMutation.mutateAsync({
        file: pickedFiles[0],
        fileName: documentTitle.trim(),
      });

      toast.success(response.message || 'Document accepted for processing');
      router.push({
        pathname: '/processing',
        params: {
          documentId: response.document_id,
          status: response.status,
        },
      });
    } catch (error) {
      const appError = parseApiError(error);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(appError.message);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const removedFile = pickedFiles.find((file) => file.id === fileId);

    setPickedFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));

    if (removedFile) {
      toast.success(`${removedFile.name} removed`);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
            eyebrow="UPLOAD DOCUMENT"
            title="Upload document"
            subtitle="Choose a PDF or scan pages into one PDF."
            leftAccessibilityLabel="Back"
            rightIconName="photo-camera"
            rightAccessibilityLabel="Open camera scanner"
            onPressLeft={() => router.back()}
            onPressRight={handleOpenCameraCapture}
            onHeightChange={setHeaderHeight}
            includeTopInset
          />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + HEADER_CONTENT_GAP }]}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.titleInputContainer}>
            <Text style={styles.titleInputLabel}>Document Title</Text>
            <TextInput
              style={styles.titleInput}
              value={documentTitle}
              onChangeText={setDocumentTitle}
              placeholder="Enter document title"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <UploadDropzoneCard
            mode={pickedFiles.length > 0 ? 'selected' : 'empty'}
            files={pickedFiles}
            onChooseFile={handleChooseFile}
            onPreviewFile={handlePreviewFile}
            onShareFile={handleShareFile}
            onRemoveFile={handleRemoveFile}
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <View style={styles.uploadButtonWrap}>
              <Button
                label="Upload document"
                fullWidth
                rightIconName="arrow-forward"
                disabled={pickedFiles.length === 0 || isPreparingScanPdf || uploadMutation.isPending}
                loading={isPreparingScanPdf || uploadMutation.isPending}
                onPress={handleContinueToProcessing}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleOpenCameraCapture}
              style={styles.cameraFab}
            >
              <MaterialIcons name="photo-camera" size={24} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      </View>

      <ManageWhitelistBottomSheet
        visible={isWhitelistOpen}
        data={whitelistData}
        searchQuery={whitelistSearchQuery}
        onChangeSearchQuery={setWhitelistSearchQuery}
        onClose={() => {
          setIsWhitelistOpen(false);
          setWhitelistSearchQuery('');
        }}
        onPressGrantAction={() => {}}
        onPressRevoke={handleRevokeGrant}
        onPressAddResult={handleAddWhitelistResult}
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
    paddingHorizontal: 16,
    gap: 12,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: 'center',
  },
  footerActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  uploadButtonWrap: {
    flex: 1,
    maxWidth: 252,
  },
  cameraFab: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  titleInputContainer: {
    gap: 8,
  },
  titleInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.navy,
  },
});
