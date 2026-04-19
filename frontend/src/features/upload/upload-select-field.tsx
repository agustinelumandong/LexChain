import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
  surface: '#FFFFFF',
};

type UploadSelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  isOpen?: boolean;
  onPress?: () => void;
  onSelect?: (value: string) => void;
};

export function UploadSelectField({
  label,
  value,
  options,
  isOpen = false,
  onPress,
  onSelect,
}: UploadSelectFieldProps) {
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
        <View style={styles.dropdownList}>
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <Pressable
                key={option}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => onSelect?.(option)}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option}
                </Text>

                {isSelected ? (
                  <MaterialIcons name="check-circle" size={18} color={COLORS.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  value: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
