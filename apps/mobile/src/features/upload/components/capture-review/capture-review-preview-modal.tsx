import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Modal, Pressable, View } from 'react-native';

import type { PickedUploadFile } from '@/types';

import { captureReviewColors, captureReviewStyles } from './capture-review.styles';

type CaptureReviewPreviewModalProps = {
  file: PickedUploadFile | null;
  onClose: () => void;
};

export function CaptureReviewPreviewModal({ file, onClose }: CaptureReviewPreviewModalProps) {
  return (
    <Modal visible={file !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={captureReviewStyles.previewModal}>
        <Pressable style={captureReviewStyles.previewBackdrop} onPress={onClose} />

        <View style={captureReviewStyles.previewShell}>
          <Pressable style={captureReviewStyles.previewClose} onPress={onClose}>
            <MaterialIcons name="close" size={18} color={captureReviewColors.white} />
          </Pressable>

          {file ? (
            <Image source={{ uri: file.uri }} style={captureReviewStyles.previewModalImage} contentFit="contain" />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
