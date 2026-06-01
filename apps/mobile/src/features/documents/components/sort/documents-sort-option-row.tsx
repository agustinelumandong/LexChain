import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { documentsSortSheetColors, documentsSortSheetStyles } from './documents-sort-sheet.styles';

export type SortOption = {
  label: string;
  value: string;
  helperText?: string;
};

type DocumentsSortOptionRowProps = {
  option: SortOption;
  selected: boolean;
  onPress: () => void;
};

export function DocumentsSortOptionRow({
  option,
  selected,
  onPress,
}: DocumentsSortOptionRowProps) {
  return (
    <Pressable
      style={[
        documentsSortSheetStyles.optionRow,
        selected && documentsSortSheetStyles.optionRowSelected,
      ]}
      onPress={onPress}
    >
      <View style={documentsSortSheetStyles.optionCopy}>
        <Text
          style={[
            documentsSortSheetStyles.optionLabel,
            selected && documentsSortSheetStyles.optionLabelSelected,
          ]}
        >
          {option.label}
        </Text>
        {option.helperText ? (
          <Text style={documentsSortSheetStyles.optionHelper}>{option.helperText}</Text>
        ) : null}
      </View>

      {selected ? (
        <MaterialIcons name="check-circle" size={18} color={documentsSortSheetColors.primary} />
      ) : null}
    </Pressable>
  );
}
