import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PickedUploadFile } from '@/features/upload/upload-file';
import {
  getPendingCapturedFiles,
  setPendingCapturedFiles,
} from '@/features/upload/upload-session';
import { Button } from '@/shared/components/ui/button';

const COLORS = {
  bg: '#041228',
  overlay: 'rgba(4, 18, 40, 0.68)',
  white: '#FFFFFF',
  primary: '#1689F5',
  primarySoft: 'rgba(22, 137, 245, 0.16)',
  textMuted: '#B8CCE8',
  frame: 'rgba(255,255,255,0.18)',
};

type CapturedPhoto = {
  uri: string;
  width?: number;
  height?: number;
};

function formatFileSizeFromDimensions(photo: CapturedPhoto) {
  if (!photo.width || !photo.height) {
    return undefined;
  }

  const estimatedBytes = photo.width * photo.height * 0.45;

  if (estimatedBytes >= 1024 * 1024) {
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(estimatedBytes / 1024))} KB`;
}

export default function CameraCaptureScreen() {
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

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
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

  const buildCapturedFile = (photo: CapturedPhoto, index: number): PickedUploadFile => ({
    id: `${photo.uri}-${index}-${Date.now()}`,
    name: `Captured page ${index + 1}`,
    sizeLabel: formatFileSizeFromDimensions(photo),
    uri: photo.uri,
    mimeType: 'image/jpeg',
    sourceLabel: 'camera',
  });

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

  if (!permission) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.permissionWrap}>
          <Text style={styles.permissionEyebrow}>CAMERA ACCESS</Text>
          <Text style={styles.permissionTitle}>Allow camera access</Text>
          <Text style={styles.permissionBody}>
            LexChain needs camera access so you can capture a document directly in the app.
          </Text>

          <View style={styles.permissionActions}>
            <Button label="Grant permission" fullWidth onPress={requestPermission} />
            <Button
              label="Back to upload"
              variant="secondary"
              fullWidth
              onPress={() => router.back()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto.uri }} style={styles.cameraPreview} contentFit="cover" />
        ) : (
          <CameraView ref={cameraRef} style={styles.cameraPreview} facing={facing} />
        )}

        <View style={styles.topBar}>
          <Pressable style={styles.topAction} onPress={() => router.back()}>
            <MaterialIcons name="close" size={20} color={COLORS.white} />
          </Pressable>

          <View style={styles.topCopy}>
            <Text style={styles.topEyebrow}>CAMERA</Text>
            <Text style={styles.topTitle}>Capture document</Text>
          </View>

          <Pressable
            style={styles.topAction}
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
          >
            <MaterialIcons name="flip-camera-ios" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        {!capturedPhoto ? (
          <View style={styles.frameWrap} pointerEvents="none">
            <View style={styles.captureFrame} />
            <Text style={styles.frameHint}>Align document inside frame</Text>
          </View>
        ) : null}

        <View style={styles.bottomPanel}>
          {capturedQueue.length > 0 ? (
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>
                {capturedQueue.length} page{capturedQueue.length > 1 ? 's' : ''} ready
              </Text>
            </View>
          ) : null}

          {capturedPhoto ? (
            <>
              <Text style={styles.panelTitle}>Photo ready</Text>
              <Text style={styles.panelBody}>
                Retake if edges are cut off, add another page, or finish with this capture.
              </Text>

              <View style={styles.panelActions}>
                <Button
                  label="Retake"
                  variant="secondary"
                  fullWidth
                  onPress={() => setCapturedPhoto(null)}
                />
                <Button
                  label="Add page"
                  variant="secondary"
                  fullWidth
                  onPress={handleAddPage}
                />
                <Button
                  label={capturedQueue.length > 0 ? 'Finish capture' : 'Use photo'}
                  fullWidth
                  onPress={handleFinishCapture}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.panelTitle}>Ready to scan</Text>
              <Text style={styles.panelBody}>
                Capture page by page. Each accepted shot is added to your upload queue.
              </Text>

              <View style={styles.captureControls}>
                <Pressable
                  style={styles.galleryStub}
                  onPress={() => {
                    if (capturedQueue.length > 0) {
                      router.push('/capture-review');
                    }
                  }}
                >
                  <MaterialIcons name="collections" size={20} color={COLORS.white} />
                </Pressable>

                <Pressable style={styles.captureButton} onPress={handleTakePhoto}>
                  <View style={styles.captureButtonInner} />
                </Pressable>

                {capturedQueue.length > 0 ? (
                  <Pressable style={styles.flashStub} onPress={handleFinishCapture}>
                    <MaterialIcons name="check" size={20} color={COLORS.white} />
                  </Pressable>
                ) : (
                  <Pressable style={styles.flashStub}>
                    <MaterialIcons name="flash-off" size={20} color={COLORS.white} />
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
      </View>
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
  permissionWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  permissionEyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  permissionTitle: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  permissionBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  permissionActions: {
    gap: 12,
    marginTop: 8,
  },
  cameraPreview: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topAction: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    alignItems: 'center',
    gap: 4,
  },
  topEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  frameWrap: {
    position: 'absolute',
    top: '10%',
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  captureFrame: {
    width: '100%',
    aspectRatio: 0.62,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.frame,
    backgroundColor: 'transparent',
  },
  frameHint: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  bottomPanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    borderRadius: 28,
    padding: 18,
    backgroundColor: COLORS.overlay,
    gap: 14,
  },
  panelTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  panelBody: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  panelActions: {
    gap: 10,
  },
  queueBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primarySoft,
  },
  queueBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'none',
  },
  galleryStub: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashStub: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
});
