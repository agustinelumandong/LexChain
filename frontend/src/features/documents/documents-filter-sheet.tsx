import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, SelectDropdownField } from '@/ui';

import { fonts } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: '#F3F8FF',
  surface: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
};

type FilterOption = {
  label: string;
  value: string;
};

type DocumentsFilterSheetProps = {
  visible: boolean;
  typeOptions: FilterOption[];
  statusOptions: FilterOption[];
  selectedType: string;
  selectedStatus: string;
  selectedDate: Date | null;
  onClose: () => void;
  onChangeType: (value: string) => void;
  onChangeStatus: (value: string) => void;
  onChangeDate: (value: Date | null) => void;
  onClear: () => void;
};

export function DocumentsFilterSheet({
  visible,
  typeOptions,
  statusOptions,
  selectedType,
  selectedStatus,
  selectedDate,
  onClose,
  onChangeType,
  onChangeStatus,
  onChangeDate,
  onClear,
}: DocumentsFilterSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['88%'], []);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setIsTypeDropdownOpen(false);
      setIsStatusDropdownOpen(false);
      setIsDatePickerOpen(false);
    }
  }, [visible]);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={styles.backdrop}
    />
  );

  const selectedTypeLabel =
    typeOptions.find((option) => option.value === selectedType)?.label ?? 'All types';
  const selectedStatusLabel =
    statusOptions.find((option) => option.value === selectedStatus)?.label ?? 'All statuses';
  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Any date';

  const handleDateChange = (event: DateTimePickerEvent, nextDate?: Date) => {
    setIsDatePickerOpen(false);

    if (event.type === 'set' && nextDate) {
      onChangeDate(nextDate);
    }
  };

  const toggleTypeDropdown = () => {
    setIsStatusDropdownOpen(false);
    setIsDatePickerOpen(false);
    setIsTypeDropdownOpen((currentValue) => !currentValue);
  };

  const toggleStatusDropdown = () => {
    setIsTypeDropdownOpen(false);
    setIsDatePickerOpen(false);
    setIsStatusDropdownOpen((currentValue) => !currentValue);
  };

  const openDatePicker = () => {
    setIsTypeDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsDatePickerOpen(true);
  };

  const closeDropdowns = () => {
    setIsTypeDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <View style={styles.contentWrap}>
        <BottomSheetScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable style={styles.leftAction} onPress={() => bottomSheetRef.current?.dismiss()}>
              <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
              <Text style={styles.topBarLabel}>Documents</Text>
            </Pressable>

            <MaterialIcons name="filter-list" size={18} color={COLORS.textMuted} />
          </View>

          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>DOCUMENT FILTERS</Text>
            <Text style={styles.title}>Filter documents</Text>
            <Text style={styles.description}>
              Narrow your document list by type, status, or date.
            </Text>
          </View>

          <View style={[styles.section, isTypeDropdownOpen && styles.sectionActive]}>
            <SelectDropdownField
              label="Document type"
              value={selectedTypeLabel}
              selectedOption={selectedType}
            options={typeOptions}
            isOpen={isTypeDropdownOpen}
            onPress={toggleTypeDropdown}
            onOutsidePress={closeDropdowns}
            onSelect={(value) => {
              onChangeType(value);
              setIsTypeDropdownOpen(false);
              }}
            />
          </View>

          <View style={[styles.section, isStatusDropdownOpen && styles.sectionActive]}>
            <SelectDropdownField
              label="Status"
              value={selectedStatusLabel}
              selectedOption={selectedStatus}
            options={statusOptions}
            isOpen={isStatusDropdownOpen}
            onPress={toggleStatusDropdown}
            onOutsidePress={closeDropdowns}
            onSelect={(value) => {
              onChangeStatus(value);
              setIsStatusDropdownOpen(false);
              }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>

            <Pressable style={styles.fieldRow} onPress={openDatePicker}>
              <View style={styles.fieldRowLeft}>
                <MaterialIcons name="calendar-month" size={18} color={COLORS.primary} />
                <Text style={styles.fieldValue}>{selectedDateLabel}</Text>
              </View>

              <MaterialIcons name="edit-calendar" size={18} color={COLORS.textMuted} />
            </Pressable>

            {selectedDate ? (
              <Pressable style={styles.inlineClearRow} onPress={() => onChangeDate(null)}>
                <MaterialIcons name="close" size={16} color={COLORS.primary} />
                <Text style={styles.inlineClearText}>Clear selected date</Text>
              </Pressable>
            ) : null}
          </View>

          {isDatePickerOpen ? (
            <DateTimePicker
              value={selectedDate ?? new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          ) : null}
        </BottomSheetScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Button
            label="Clear filters"
            variant="secondary"
            fullWidth
            onPress={onClear}
          />
          <Button
            label="Done"
            fullWidth
            onPress={() => bottomSheetRef.current?.dismiss()}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#B9D9FF',
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  headerBlock: {
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  section: {
    gap: 10,
    zIndex: 1,
  },
  sectionActive: {
    zIndex: 20,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  fieldRow: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fieldValue: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
    flex: 1,
  },
  dropdownList: {
    gap: 10,
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionRowSelected: {
    backgroundColor: COLORS.surfaceSoft,
    borderColor: '#A8D1FF',
  },
  optionLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  inlineClearRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  inlineClearText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  footer: {
    zIndex: 20,
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
