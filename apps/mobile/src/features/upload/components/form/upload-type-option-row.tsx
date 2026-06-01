import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { uploadTypeBottomSheetColors, uploadTypeBottomSheetStyles } from './upload-type-bottom-sheet.styles';

type UploadTypeOptionRowProps = {
  option: string;
  selected: boolean;
  onPress: () => void;
};

export function UploadTypeOptionRow({
  option,
  selected,
  onPress,
}: UploadTypeOptionRowProps) {
  return (
    <Pressable
      style={[
        uploadTypeBottomSheetStyles.option,
        selected && uploadTypeBottomSheetStyles.optionSelected,
      ]}
      onPress={onPress}
    >
      <View style={uploadTypeBottomSheetStyles.optionCopy}>
        <Text
          style={[
            uploadTypeBottomSheetStyles.optionLabel,
            selected && uploadTypeBottomSheetStyles.optionLabelSelected,
          ]}
        >
          {option}
        </Text>
        <Text style={uploadTypeBottomSheetStyles.optionHint}>
          {selected ? 'Currently selected' : 'Tap to select'}
        </Text>
      </View>

      {selected ? (
        <MaterialIcons name="check-circle" size={20} color={uploadTypeBottomSheetColors.primary} />
      ) : (
        <MaterialIcons name="chevron-right" size={20} color={uploadTypeBottomSheetColors.textMuted} />
      )}
    </Pressable>
  );
}
