import { Text, View } from 'react-native';

import { uploadDropzoneStyles } from './upload-dropzone-card.styles';

type UploadDropzoneMetaChipProps = {
  label: string;
};

export function UploadDropzoneMetaChip({ label }: UploadDropzoneMetaChipProps) {
  return (
    <View style={uploadDropzoneStyles.metaChip}>
      <Text style={uploadDropzoneStyles.metaChipLabel}>{label}</Text>
    </View>
  );
}
