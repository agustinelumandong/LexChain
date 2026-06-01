import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import {
  CAMERA_CAPTURE_COLORS as COLORS,
  cameraCaptureStyles as styles,
} from './camera-capture.styles';

type CameraCaptureControlsProps = {
  queueCount: number;
  onOpenReview: () => void;
  onTakePhoto: () => void;
  onFinishCapture: () => void;
};

export function CameraCaptureControls({
  queueCount,
  onOpenReview,
  onTakePhoto,
  onFinishCapture,
}: CameraCaptureControlsProps) {
  return (
    <View style={styles.captureControls}>
      <Pressable style={styles.galleryStub} onPress={onOpenReview}>
        <MaterialIcons name="collections" size={20} color={COLORS.white} />
        {queueCount > 0 ? (
          <View style={styles.queueBubble}>
            <Text style={styles.queueBubbleText}>
              {queueCount > 99 ? '99+' : queueCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable style={styles.captureButton} onPress={onTakePhoto}>
        <View style={styles.captureButtonInner} />
      </Pressable>

      {queueCount > 0 ? (
        <Pressable style={styles.flashStub} onPress={onFinishCapture}>
          <MaterialIcons name="check" size={20} color={COLORS.white} />
        </Pressable>
      ) : (
        <Pressable style={styles.flashStub}>
          <MaterialIcons name="flash-off" size={20} color={COLORS.white} />
        </Pressable>
      )}
    </View>
  );
}
