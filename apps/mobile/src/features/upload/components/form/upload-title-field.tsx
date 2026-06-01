import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { uploadScreenColors, uploadScreenStyles } from '../../screens/upload-screen.styles';

type UploadTitleFieldProps = Pick<TextInputProps, 'value' | 'onChangeText'> & {
  errorText?: string;
};

export function UploadTitleField({
  errorText,
  value,
  onChangeText,
}: UploadTitleFieldProps) {
  const hasError = Boolean(errorText);

  return (
    <View style={uploadScreenStyles.titleInputContainer}>
      <Text style={uploadScreenStyles.titleInputLabel}>Document Title</Text>
      <TextInput
        style={[
          uploadScreenStyles.titleInput,
          hasError && uploadScreenStyles.titleInputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter document title"
        placeholderTextColor={uploadScreenColors.textMuted}
      />
      {hasError ? (
        <Text style={uploadScreenStyles.titleInputErrorText}>{errorText}</Text>
      ) : null}
    </View>
  );
}
