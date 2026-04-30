import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { AccessWhitelistCard, ManageWhitelistBottomSheet } from '@/features/document';
import { useCloseSheetOnBack } from '@/hooks';
import { Button, SelectDropdownField } from '@/ui';
import type { ManageWhitelistData, PickedUploadFile } from '@/types';
import {
  consumePendingCapturedFiles,
  UploadDropzoneCard,
  UploadTopBar,
} from '@/features/upload';

const COLORS = {
  bg: '#F3F8FF',
  primary: '#1689F5',
  white: '#FFFFFF',
};

const DOCUMENT_TYPE_OPTIONS = [
  'Deed of Sale',
  'Lease Contract',
  'Affidavit',
  'Memorandum',
  'Special Power of Attorney',
];

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

export default function UploadScreen() {
  const router = useRouter();
  const [selectedDocumentType, setSelectedDocumentType] = useState('Deed of Sale');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const [whitelistData, setWhitelistData] = useState(INITIAL_WHITELIST);
  const [pickedFiles, setPickedFiles] = useState<PickedUploadFile[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const pendingCapturedFiles = consumePendingCapturedFiles();

      if (pendingCapturedFiles.length > 0) {
        setPickedFiles((currentFiles) => [...currentFiles, ...pendingCapturedFiles]);
        toast.success(
          pendingCapturedFiles.length === 1
            ? 'Captured page added'
            : `${pendingCapturedFiles.length} captured pages added`,
        );
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

  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: ['application/pdf', 'image/*'],
      });

      if (result.canceled) {
        return;
      }

      if (!result.assets?.length) {
        toast.warning('No files were selected');
        return;
      }

      setPickedFiles((currentFiles) => [
        ...currentFiles,
        ...result.assets.map((asset, index) => ({
          id: `${asset.uri}-${Date.now()}-${index}`,
          name: asset.name,
          sizeLabel: formatFileSize(asset.size),
          uri: asset.uri,
          mimeType: asset.mimeType,
          sourceLabel: 'file' as const,
        })),
      ]);

      toast.success(
        result.assets.length === 1
          ? 'File added to upload'
          : `${result.assets.length} files added to upload`,
      );
    } catch (error) {
      console.error('Failed to choose upload file', error);
      toast.error('Failed to choose file');
    }
  };

  const handleOpenCameraCapture = () => {
    router.push('/camera-capture');
  };

  const handleContinueToProcessing = () => {
    if (pickedFiles.length === 0) {
      toast.warning('Add a file or captured page first');
      return;
    }

    toast.success('Upload started');
    router.push('/processing');
  };

  const handleRemoveFile = (fileId: string) => {
    const removedFile = pickedFiles.find((file) => file.id === fileId);

    setPickedFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));

    if (removedFile) {
      toast.success(`${removedFile.name} removed`);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <UploadTopBar
            onPressBack={() => router.back()}
            onPressCamera={handleOpenCameraCapture}
          />

          <SelectDropdownField
            label="Document Type"
            value={selectedDocumentType}
            options={DOCUMENT_TYPE_OPTIONS}
            isOpen={isTypeDropdownOpen}
            onPress={() => setIsTypeDropdownOpen((currentValue) => !currentValue)}
            onOutsidePress={() => setIsTypeDropdownOpen(false)}
            onSelect={(value) => {
              setSelectedDocumentType(value);
              setIsTypeDropdownOpen(false);
            }}
          />

          <UploadDropzoneCard
            mode={pickedFiles.length > 0 ? 'selected' : 'empty'}
            files={pickedFiles}
            onChooseFile={handleChooseFile}
            onRemoveFile={handleRemoveFile}
          />

          <AccessWhitelistCard
            allowedCountLabel={updateWhitelistCountLabel(whitelistData.grants.length)}
            helperText="Set document access before upload so authorized users can verify it later."
            onPressManage={openWhitelist}
            onPressAdd={openWhitelist}
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <View style={styles.uploadButtonWrap}>
              <Button
                label="Upload document"
                fullWidth
                rightIconName="arrow-forward"
                disabled={pickedFiles.length === 0}
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
    paddingTop: 12,
    paddingBottom: 148,
    gap: 20,
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
    shadowColor: '#1689F5',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});
