import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { SelectDropdownOptionRow } from './select-dropdown-option-row';
import {
  selectDropdownFieldColors,
  selectDropdownFieldStyles as styles,
} from './select-dropdown-field.styles';

type SelectDropdownFieldProps = {
  label: string;
  value: string;
  options: (string | { label: string; value: string })[];
  selectedOption?: string;
  isOpen?: boolean;
  onPress?: () => void;
  onSelect?: (value: string) => void;
  onOutsidePress?: () => void;
};

export function SelectDropdownField({
  label,
  value,
  options,
  selectedOption,
  isOpen = false,
  onPress,
  onSelect,
  onOutsidePress,
}: SelectDropdownFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.field,
          isOpen && styles.fieldActive,
          pressed && styles.fieldPressed,
        ]}
        onPress={onPress}
      >
        <Text style={[styles.value, isOpen && styles.valueActive]}>{value}</Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color={isOpen ? selectDropdownFieldColors.primary : selectDropdownFieldColors.textMuted}
        />
      </Pressable>

      {isOpen ? (
        <>
          <Pressable style={styles.outsideOverlay} onPress={onOutsidePress} />

          <View style={styles.dropdownList}>
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = optionValue === (selectedOption ?? value);

              return (
                <SelectDropdownOptionRow
                  key={optionValue}
                  label={optionLabel}
                  selected={isSelected}
                  onPress={() => onSelect?.(optionValue)}
                />
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}
