import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';

import type { PickedUploadFile } from '@/types';

import type { CapturedPhoto } from '../types/camera-capture.types';
import { buildCapturedFile } from '../utils/camera-capture-file';
import { getPendingCapturedFiles, setPendingCapturedFiles } from '../upload-session';

export function useCameraCaptureFlow() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [capturedQueue, setCapturedQueue] = useState<PickedUploadFile[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setCapturedQueue(getPendingCapturedFiles());
    }, []),
  );

  const handleBack = () => {
    router.back();
  };

  const handleOpenReview = () => {
    if (capturedQueue.length > 0) {
      router.push('/capture-review');
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.72,
      });

      setCapturedPhoto({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAddPage = () => {
    if (!capturedPhoto) {
      return;
    }

    setCapturedQueue((currentQueue) => {
      const nextQueue = [
        ...currentQueue,
        buildCapturedFile(capturedPhoto, currentQueue.length),
      ];
      setPendingCapturedFiles(nextQueue);
      return nextQueue;
    });
    setCapturedPhoto(null);
  };

  const handleFinishCapture = () => {
    const nextQueue = [...capturedQueue];

    if (capturedPhoto) {
      nextQueue.push(buildCapturedFile(capturedPhoto, nextQueue.length));
    }

    if (nextQueue.length === 0) {
      return;
    }

    setPendingCapturedFiles(nextQueue);
    router.back();
  };

  return {
    cameraRef,
    permission,
    requestPermission,
    facing,
    setFacing,
    capturedPhoto,
    setCapturedPhoto,
    capturedQueue,
    isCapturing,
    handleBack,
    handleOpenReview,
    handleTakePhoto,
    handleAddPage,
    handleFinishCapture,
  };
}
