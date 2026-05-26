import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import type { PickedUploadFile } from '@/types';

import { uploadDropzoneColors, uploadDropzoneStyles } from './upload-dropzone-card.styles';

type UploadDropzoneSelectedListProps = {
  files: PickedUploadFile[];
  onPreviewFile?: (file: PickedUploadFile) => void;
  onRemoveFile?: (fileId: string) => void;
};

export function UploadDropzoneSelectedList({
  files,
  onPreviewFile,
  onRemoveFile,
}: UploadDropzoneSelectedListProps) {
  return (
    <View style={uploadDropzoneStyles.selectedList}>
      {files.map((file, index) => (
        <View key={file.id} style={uploadDropzoneStyles.selectedFileCard}>
          <View style={uploadDropzoneStyles.selectedFileCopy}>
            <Text style={uploadDropzoneStyles.selectedFileName} numberOfLines={1}>
              {file.name || `Selected document ${index + 1}`}
            </Text>
            <Text style={uploadDropzoneStyles.selectedFileMeta}>
              {[file.sourceLabel.toUpperCase(), file.sizeLabel].filter(Boolean).join(' • ')}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onPreviewFile?.(file)}
            style={uploadDropzoneStyles.fileActionButton}
          >
            <MaterialIcons name="visibility" size={16} color={uploadDropzoneColors.primary} />
          </Pressable>

          <Pressable style={uploadDropzoneStyles.removeButton} onPress={() => onRemoveFile?.(file.id)}>
            <Text style={uploadDropzoneStyles.removeButtonLabel}>X</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
