import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

import { useBooks, useUploadDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import type { PickedUploadFile } from '@/types';

import { createPdfFromImages } from '../create-pdf-from-images';
import {
  consumePendingCapturedFiles,
  setPendingCapturedFiles,
} from '../upload-session';
import {
  NativeDocumentScanCancelledError,
  scanDocumentsWithNativeScanner,
} from '../native-document-scanner';
import { formatUploadFileSize, isPdfFile } from '../utils/upload-file';
import { sanitizeDocumentTitle, validateDocumentTitle } from '../utils/document-title';

export function useUploadFlow() {
  const router = useRouter();
  const [pickedFiles, setPickedFiles] = useState<PickedUploadFile[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [isPreparingScanPdf, setIsPreparingScanPdf] = useState(false);
  const booksQuery = useBooks({ limit: 50, offset: 0 });
  const uploadMutation = useUploadDocument();
  const books = useMemo(() => booksQuery.data ?? [], [booksQuery.data]);
  const documentTitleError = useMemo(
    () => (documentTitle ? validateDocumentTitle(documentTitle) : undefined),
    [documentTitle],
  );
  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId),
    [books, selectedBookId],
  );

  const handleChangeDocumentTitle = useCallback((value: string) => {
    setDocumentTitle(sanitizeDocumentTitle(value));
  }, []);

  const convertCapturedFilesToPdf = useCallback((capturedFiles: PickedUploadFile[]) => {
    if (capturedFiles.length === 0) {
      return;
    }

    setIsPreparingScanPdf(true);

    void createPdfFromImages(capturedFiles)
      .then((scanPdf) => {
        setPickedFiles([scanPdf]);
        setDocumentTitle((currentTitle) =>
          currentTitle.trim() ? currentTitle : sanitizeDocumentTitle(scanPdf.name),
        );
        toast.success(
          capturedFiles.length === 1
            ? 'Captured page converted to PDF'
            : `${capturedFiles.length} captured pages converted to PDF`,
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
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const pendingCapturedFiles = consumePendingCapturedFiles();

      convertCapturedFilesToPdf(pendingCapturedFiles);
    }, [convertCapturedFilesToPdf]),
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
        currentTitle.trim() ? currentTitle : sanitizeDocumentTitle(selectedFile.name),
      );

      toast.success('PDF ready to upload');
    } catch (error) {
      console.error('Failed to choose upload file', error);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to choose file');
    }
  };

  const handleOpenManualCameraCapture = useCallback(() => {
    router.push('/camera-capture');
  }, [router]);

  const handleOpenCameraCapture = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (process.env.EXPO_OS !== 'android') {
      handleOpenManualCameraCapture();
      return;
    }

    try {
      const scannedFiles = await scanDocumentsWithNativeScanner();

      setPendingCapturedFiles(scannedFiles);
      convertCapturedFilesToPdf(consumePendingCapturedFiles());
    } catch (error) {
      if (error instanceof NativeDocumentScanCancelledError) {
        return;
      }

      console.error('Native document scanner unavailable', error);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Scanner unavailable. Opening manual camera.');
      handleOpenManualCameraCapture();
    }
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
        title: sanitizeDocumentTitle(documentTitle) || sanitizeDocumentTitle(file.name),
        uri: file.uri,
        role: 'owner',
      },
    });
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

    const sanitizedTitle = sanitizeDocumentTitle(documentTitle);

    if (!sanitizedTitle) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Enter a document title');
      return;
    }

    if (!selectedBookId) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Choose a register book');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await uploadMutation.mutateAsync({
        bookId: selectedBookId,
        file: pickedFiles[0],
        fileName: sanitizedTitle,
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
    books,
    booksError: booksQuery.error,
    documentTitle,
    documentTitleError,
    handleChooseFile,
    handleChangeDocumentTitle,
    handleContinueToProcessing,
    handleOpenCameraCapture,
    handlePreviewFile,
    handleRemoveFile,
    isLoadingBooks: booksQuery.isLoading,
    isPreparingScanPdf,
    isUploadingDocument: uploadMutation.isPending,
    pickedFiles,
    selectedBook,
    selectedBookId,
    setSelectedBookId,
  };
}
