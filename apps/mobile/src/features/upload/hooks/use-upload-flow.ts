import React, { useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { toast } from 'sonner-native';

import { useUploadDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import type { PickedUploadFile } from '@/types';

import { createPdfFromImages } from '../create-pdf-from-images';
import { consumePendingCapturedFiles } from '../upload-session';
import { formatUploadFileSize, isPdfFile } from '../utils/upload-file';

export function useUploadFlow() {
  const router = useRouter();
  const [pickedFiles, setPickedFiles] = useState<PickedUploadFile[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [isPreparingScanPdf, setIsPreparingScanPdf] = useState(false);
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
        sizeLabel: formatUploadFileSize(asset.size),
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

  return {
    documentTitle,
    handleChooseFile,
    handleContinueToProcessing,
    handleOpenCameraCapture,
    handlePreviewFile,
    handleRemoveFile,
    handleShareFile,
    isPreparingScanPdf,
    isUploadingDocument: uploadMutation.isPending,
    pickedFiles,
    setDocumentTitle,
  };
}
