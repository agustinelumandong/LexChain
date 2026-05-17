import { MaterialIcons } from '@expo/vector-icons';
import type { CameraType } from 'expo-camera';
import { Dispatch, SetStateAction } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  CAMERA_CAPTURE_COLORS as COLORS,
  cameraCaptureStyles as styles,
} from './camera-capture.styles';

type CameraCaptureTopBarProps = {
  facing: CameraType;
  setFacing: Dispatch<SetStateAction<CameraType>>;
  onBack: () => void;
};

export function CameraCaptureTopBar({
  facing,
  setFacing,
  onBack,
}: CameraCaptureTopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to upload"
        style={styles.topBarButton}
        onPress={onBack}
      >
        <MaterialIcons name="close" size={20} color={COLORS.white} />
      </Pressable>

      <View style={styles.topBarCopy}>
        <Text style={styles.topBarEyebrow}>CAMERA</Text>
        <Text style={styles.topBarTitle}>Scan to PDF</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Flip camera"
        style={styles.topBarButton}
        onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
      >
        <MaterialIcons name="flip-camera-ios" size={20} color={COLORS.white} />
      </Pressable>
    </View>
  );
}
