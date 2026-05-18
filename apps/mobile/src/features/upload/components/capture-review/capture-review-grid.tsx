import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { PickedUploadFile } from '@/types';

import { captureReviewStyles } from './capture-review.styles';

type CaptureReviewGridProps = {
  capturedFiles: PickedUploadFile[];
  onPreviewFile: (file: PickedUploadFile) => void;
  onRemoveFile: (fileId: string) => void;
};

export function CaptureReviewGrid({
  capturedFiles,
  onPreviewFile,
  onRemoveFile,
}: CaptureReviewGridProps) {
  if (capturedFiles.length === 0) {
    return (
      <View style={captureReviewStyles.emptyState}>
        <Text style={captureReviewStyles.emptyTitle}>No captured pages yet</Text>
        <Text style={captureReviewStyles.emptyBody}>Go back and capture a page first.</Text>
      </View>
    );
  }

  return (
    <View style={captureReviewStyles.grid}>
      {capturedFiles.map((file, index) => (
        <View key={file.id} style={captureReviewStyles.gridCard}>
          <Pressable onPress={() => onPreviewFile(file)}>
            <Image source={{ uri: file.uri }} style={captureReviewStyles.gridPreview} contentFit="cover" />
          </Pressable>

          <View style={captureReviewStyles.gridFooter}>
            <View style={captureReviewStyles.gridCopy}>
              <Text style={captureReviewStyles.cardTitle}>Page {index + 1}</Text>
              <Text style={captureReviewStyles.cardMeta} numberOfLines={1}>
                {[file.sourceLabel.toUpperCase(), file.sizeLabel].filter(Boolean).join(' • ')}
              </Text>
            </View>

            <Pressable style={captureReviewStyles.removeButton} onPress={() => onRemoveFile(file.id)}>
              <Text style={captureReviewStyles.removeButtonLabel}>X</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}
