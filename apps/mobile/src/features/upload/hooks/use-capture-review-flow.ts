import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';

import type { PickedUploadFile } from '@/types';

import { getPendingCapturedFiles, setPendingCapturedFiles } from '../upload-session';

export function useCaptureReviewFlow() {
  const router = useRouter();
  const [capturedFiles, setCapturedFiles] = useState<PickedUploadFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PickedUploadFile | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setCapturedFiles(getPendingCapturedFiles());
    }, []),
  );

  const handleBack = () => {
    router.back();
  };

  const handleRemove = (fileId: string) => {
    const nextFiles = capturedFiles.filter((file) => file.id !== fileId);
    setCapturedFiles(nextFiles);
    setPendingCapturedFiles(nextFiles);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return {
    capturedFiles,
    previewFile,
    setPreviewFile,
    handleBack,
    handleRemove,
    handleClosePreview,
  };
}
