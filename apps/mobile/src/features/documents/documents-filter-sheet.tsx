import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { SelectDropdownField } from '@/ui';

import { DocumentsFilterDateSection } from './documents-filter-date-section';
import { DocumentsFilterFooter } from './documents-filter-footer';
import {
  DOCUMENTS_FILTER_COLORS as COLORS,
  documentsFilterStyles as styles,
} from './documents-filter-sheet.styles';
import { useDocumentsFilterSheet } from './hooks/use-documents-filter-sheet';

export type FilterOption = {
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
  const filterSheet = useDocumentsFilterSheet({
    visible,
    typeOptions,
    statusOptions,
    selectedType,
    selectedStatus,
    selectedDate,
    onChangeDate,
  });

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

  return (
    <BottomSheetModal
      ref={filterSheet.bottomSheetRef}
      index={0}
      snapPoints={filterSheet.snapPoints}
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
            <Pressable
              style={styles.leftAction}
              onPress={() => filterSheet.bottomSheetRef.current?.dismiss()}
            >
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

          <View style={[styles.section, filterSheet.isTypeDropdownOpen && styles.sectionActive]}>
            <SelectDropdownField
              label="Document type"
              value={filterSheet.selectedTypeLabel}
              selectedOption={selectedType}
              options={typeOptions}
              isOpen={filterSheet.isTypeDropdownOpen}
              onPress={filterSheet.toggleTypeDropdown}
              onOutsidePress={filterSheet.closeDropdowns}
              onSelect={(value) => {
                onChangeType(value);
                filterSheet.closeTypeDropdown();
              }}
            />
          </View>

          <View style={[styles.section, filterSheet.isStatusDropdownOpen && styles.sectionActive]}>
            <SelectDropdownField
              label="Status"
              value={filterSheet.selectedStatusLabel}
              selectedOption={selectedStatus}
              options={statusOptions}
              isOpen={filterSheet.isStatusDropdownOpen}
              onPress={filterSheet.toggleStatusDropdown}
              onOutsidePress={filterSheet.closeDropdowns}
              onSelect={(value) => {
                onChangeStatus(value);
                filterSheet.closeStatusDropdown();
              }}
            />
          </View>

          <DocumentsFilterDateSection
            selectedDate={selectedDate}
            selectedDateLabel={filterSheet.selectedDateLabel}
            isDatePickerOpen={filterSheet.isDatePickerOpen}
            onOpenDatePicker={filterSheet.openDatePicker}
            onChangeDate={onChangeDate}
            onDatePickerChange={filterSheet.handleDateChange}
          />
        </BottomSheetScrollView>

        <DocumentsFilterFooter
          bottomInset={filterSheet.insets.bottom}
          onClear={onClear}
          onDone={() => filterSheet.bottomSheetRef.current?.dismiss()}
        />
      </View>
    </BottomSheetModal>
  );
}
