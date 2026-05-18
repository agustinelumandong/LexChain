import { CameraView, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PickedUploadFile } from '@/types';

import { CameraCaptureControls } from '../camera-capture-controls';
import { CameraCaptureFrame } from '../camera-capture-frame';
import { CameraCapturePermission } from '../camera-capture-permission';
import { CameraCapturePreviewActions } from '../camera-capture-preview-actions';
import { CameraCaptureTopBar } from '../camera-capture-top-bar';
import { cameraCaptureStyles as styles } from '../camera-capture.styles';
import { useCameraCaptureFlow } from '../hooks/use-camera-capture-flow';
import type { CapturedPhoto } from '../types/camera-capture.types';

export default function CameraCaptureScreen() {
  const camera = useCameraCaptureFlow();

  if (!camera.permission) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (!camera.permission.granted) {
    return (
      <CameraCapturePermission
        onGrantPermission={camera.requestPermission}
        onBack={camera.handleBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.surface}>
        {camera.capturedPhoto ? (
          <Image
            source={{ uri: camera.capturedPhoto.uri }}
            style={styles.cameraPreview}
            contentFit="cover"
          />
        ) : (
          <CameraView
            ref={camera.cameraRef as RefObject<CameraView>}
            style={styles.cameraPreview}
            facing={camera.facing}
          />
        )}

        <CameraCaptureTopBar
          facing={camera.facing}
          setFacing={camera.setFacing}
          onBack={camera.handleBack}
        />

        {!camera.capturedPhoto ? <CameraCaptureFrame /> : null}

        <CameraCaptureBottomPanel
          capturedPhoto={camera.capturedPhoto}
          capturedQueue={camera.capturedQueue}
          onRetake={() => camera.setCapturedPhoto(null)}
          onAddPage={camera.handleAddPage}
          onFinishCapture={camera.handleFinishCapture}
          onOpenReview={camera.handleOpenReview}
          onTakePhoto={camera.handleTakePhoto}
        />
      </View>
    </SafeAreaView>
  );
}

type CameraCaptureBottomPanelProps = {
  capturedPhoto: CapturedPhoto | null;
  capturedQueue: PickedUploadFile[];
  onRetake: () => void;
  onAddPage: () => void;
  onFinishCapture: () => void;
  onOpenReview: () => void;
  onTakePhoto: () => void;
};

function CameraCaptureBottomPanel({
  capturedPhoto,
  capturedQueue,
  onRetake,
  onAddPage,
  onFinishCapture,
  onOpenReview,
  onTakePhoto,
}: CameraCaptureBottomPanelProps) {
  return (
    <View style={styles.bottomPanel}>
      {capturedPhoto ? (
        <CameraCapturePreviewActions
          queueCount={capturedQueue.length}
          onRetake={onRetake}
          onAddPage={onAddPage}
          onFinishCapture={onFinishCapture}
        />
      ) : (
        <CameraCaptureControls
          queueCount={capturedQueue.length}
          onOpenReview={onOpenReview}
          onTakePhoto={onTakePhoto}
          onFinishCapture={onFinishCapture}
        />
      )}
    </View>
  );
}

export type CameraCaptureFacingState = {
  facing: CameraType;
  setFacing: Dispatch<SetStateAction<CameraType>>;
};
