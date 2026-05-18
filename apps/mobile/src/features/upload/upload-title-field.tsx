import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { uploadScreenColors, uploadScreenStyles } from './screens/upload-screen.styles';

type UploadTitleFieldProps = Pick<TextInputProps, 'value' | 'onChangeText'>;

export function UploadTitleField({
  value,
  onChangeText,
}: UploadTitleFieldProps) {
  return (
    <View style={uploadScreenStyles.titleInputContainer}>
      <Text style={uploadScreenStyles.titleInputLabel}>Document Title</Text>
      <TextInput
        style={uploadScreenStyles.titleInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter document title"
        placeholderTextColor={uploadScreenColors.textMuted}
      />
    </View>
  );
}
