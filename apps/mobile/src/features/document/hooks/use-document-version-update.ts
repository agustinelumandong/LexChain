import { useCallback, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { toast } from 'sonner-native';

import { useUpdateDocumentVersion } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import type { PickedUploadFile } from '@/types';

import { formatFileSize, isPdfFile } from '../utils/document-file';

export function useDocumentVersionUpdate(documentId?: string) {
  const [selectedUpdateFile, setSelectedUpdateFile] =
    useState<PickedUploadFile | null>(null);
  const updateVersionMutation = useUpdateDocumentVersion();

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
      return true;
    } catch (error) {
      toast.error(parseApiError(error).message);
      return false;
    }
  }, [documentId, selectedUpdateFile, updateVersionMutation]);

  const clearSelectedUpdateFile = useCallback(() => {
    setSelectedUpdateFile(null);
  }, []);

  return {
    clearSelectedUpdateFile,
    handlePickUpdateFile,
    handleUploadUpdate,
    isUpdatingVersion: updateVersionMutation.isPending,
    selectedUpdateFile,
  };
}
