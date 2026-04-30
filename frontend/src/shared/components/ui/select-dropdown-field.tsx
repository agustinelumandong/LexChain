import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';
const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
  surface: '#FFFFFF',
};

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
      <Pressable style={[styles.field, isOpen && styles.fieldActive]} onPress={onPress}>
        <Text style={[styles.value, isOpen && styles.valueActive]}>{value}</Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color={isOpen ? COLORS.primary : COLORS.textMuted}
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
                <Pressable
                  key={optionValue}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => onSelect?.(optionValue)}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {optionLabel}
                  </Text>

                  {isSelected ? (
                    <MaterialIcons name="check-circle" size={18} color={COLORS.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    zIndex: 10,
    position: 'relative',
  },
  label: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  field: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fieldActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7FBFF',
  },
  value: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  valueActive: {
    color: COLORS.primary,
  },
  dropdownList: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    zIndex: 20,
  },
  outsideOverlay: {
    position: 'absolute',
    top: -2000,
    right: -2000,
    bottom: -2000,
    left: -2000,
    zIndex: 15,
  },
  optionRow: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionRowSelected: {
    backgroundColor: '#EAF4FF',
  },
  optionLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
});
