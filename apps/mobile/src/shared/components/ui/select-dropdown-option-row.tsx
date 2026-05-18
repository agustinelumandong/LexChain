import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import {
  selectDropdownFieldColors,
  selectDropdownFieldStyles as styles,
} from './select-dropdown-field.styles';

type SelectDropdownOptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectDropdownOptionRow({
  label,
  selected,
  onPress,
}: SelectDropdownOptionRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        selected && styles.optionRowSelected,
        pressed && styles.optionRowPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>

      {selected ? (
        <MaterialIcons name="check-circle" size={18} color={selectDropdownFieldColors.primary} />
      ) : null}
    </Pressable>
  );
}
