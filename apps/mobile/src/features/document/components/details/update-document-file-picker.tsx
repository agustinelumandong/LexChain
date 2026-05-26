import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';
import type { PickedUploadFile } from '@/types';

import { updateDocumentSheetStyles } from './update-document-sheet.styles';

type UpdateDocumentFilePickerProps = {
  selectedFile: PickedUploadFile | null;
  disabled: boolean;
  onPickFile: () => void;
};

export function UpdateDocumentFilePicker({
  selectedFile,
  disabled,
  onPickFile,
}: UpdateDocumentFilePickerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        updateDocumentSheetStyles.filePickerCard,
        pressed && updateDocumentSheetStyles.menuRowPressed,
      ]}
      onPress={onPickFile}
      disabled={disabled}
    >
      <View style={updateDocumentSheetStyles.filePickerIcon}>
        <MaterialIcons name="picture-as-pdf" size={24} color={APP_COLORS.primary} />
      </View>
      <View style={updateDocumentSheetStyles.rowCopy}>
        <Text style={updateDocumentSheetStyles.filePickerTitle}>
          {selectedFile ? selectedFile.name : 'Choose PDF file'}
        </Text>
        <Text style={updateDocumentSheetStyles.filePickerDescription}>
          {selectedFile?.sizeLabel ?? 'No file selected yet'}
        </Text>
      </View>
      <MaterialIcons name="upload-file" size={22} color={APP_COLORS.textMuted} />
    </Pressable>
  );
}
