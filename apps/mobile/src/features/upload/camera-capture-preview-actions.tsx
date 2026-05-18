import { View } from 'react-native';

import { Button } from '@/ui';

import { cameraCaptureStyles as styles } from './camera-capture.styles';

type CameraCapturePreviewActionsProps = {
  queueCount: number;
  onRetake: () => void;
  onAddPage: () => void;
  onFinishCapture: () => void;
};

export function CameraCapturePreviewActions({
  queueCount,
  onRetake,
  onAddPage,
  onFinishCapture,
}: CameraCapturePreviewActionsProps) {
  return (
    <View style={styles.panelActions}>
      <Button label="Retake" variant="secondary" fullWidth onPress={onRetake} />
      <Button label="Add page" variant="secondary" fullWidth onPress={onAddPage} />
      <Button
        label={queueCount > 0 ? 'Finish scan' : 'Use photo'}
        fullWidth
        onPress={onFinishCapture}
      />
    </View>
  );
}
