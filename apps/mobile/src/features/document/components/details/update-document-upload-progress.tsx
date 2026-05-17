import { Animated, Text, View } from 'react-native';

import { updateDocumentSheetStyles } from './update-document-sheet.styles';

type UpdateDocumentUploadProgressProps = {
  progressTranslateX: Animated.AnimatedInterpolation<string | number>;
};

export function UpdateDocumentUploadProgress({
  progressTranslateX,
}: UpdateDocumentUploadProgressProps) {
  return (
    <View style={updateDocumentSheetStyles.uploadProgressCard}>
      <Text style={updateDocumentSheetStyles.uploadProgressLabel}>Updating document...</Text>
      <View style={updateDocumentSheetStyles.uploadProgressTrack}>
        <Animated.View
          style={[
            updateDocumentSheetStyles.uploadProgressFill,
            { transform: [{ translateX: progressTranslateX }] },
          ]}
        />
      </View>
    </View>
  );
}
