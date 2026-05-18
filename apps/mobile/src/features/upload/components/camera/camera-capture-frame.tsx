import { Text, View } from 'react-native';

import { cameraCaptureStyles as styles } from './camera-capture.styles';

export function CameraCaptureFrame() {
  return (
    <View style={[styles.frameWrap, styles.nonInteractive]}>
      <View style={styles.captureFrame} />
      <Text style={styles.frameHint}>Align document inside frame</Text>
    </View>
  );
}
