import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { captureReviewColors, captureReviewStyles } from './capture-review.styles';

type CaptureReviewTopBarProps = {
  onBack: () => void;
};

export function CaptureReviewTopBar({ onBack }: CaptureReviewTopBarProps) {
  return (
    <View style={captureReviewStyles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to camera"
        style={captureReviewStyles.topBarButton}
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={20} color={captureReviewColors.navy} />
      </Pressable>
      <View style={captureReviewStyles.topBarCopy}>
        <Text style={captureReviewStyles.topBarEyebrow}>CAPTURE REVIEW</Text>
        <Text style={captureReviewStyles.topBarTitle}>Captured pages</Text>
      </View>
      <View style={captureReviewStyles.topBarButton} />
    </View>
  );
}
