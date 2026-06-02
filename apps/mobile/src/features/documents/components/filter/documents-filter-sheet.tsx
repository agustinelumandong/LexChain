import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SelectDropdownField } from '@/ui';

import { DocumentsFilterDateSection } from './documents-filter-date-section';
import { DocumentsFilterFooter } from './documents-filter-footer';
import { DocumentsFilterHeader } from './documents-filter-header';
import { DocumentsFilterSection } from './documents-filter-section';
import {
  DOCUMENTS_FILTER_COLORS as COLORS,
  documentsFilterStyles as styles,
} from './documents-filter-sheet.styles';
import { DocumentsFilterTopBar } from './documents-filter-top-bar';
import { useDocumentsFilterSheet } from '../../hooks/use-documents-filter-sheet';

export type FilterOption = {
  label: string;
  value: string;
};

type DocumentsFilterSheetProps = {
  visible: boolean;
  statusOptions: FilterOption[];
  selectedStatus: string;
  selectedDate: Date | null;
  documentNumberFilter: string;
  pageNumberFilter: string;
  bookNumberFilter: string;
  onClose: () => void;
  onChangeStatus: (value: string) => void;
  onChangeDate: (value: Date | null) => void;
  onChangeDocumentNumber: (value: string) => void;
  onChangePageNumber: (value: string) => void;
  onChangeBookNumber: (value: string) => void;
  onClear: () => void;
};

export function DocumentsFilterSheet({
  visible,
  statusOptions,
  selectedStatus,
  selectedDate,
  documentNumberFilter,
  pageNumberFilter,
  bookNumberFilter,
  onClose,
  onChangeStatus,
  onChangeDate,
  onChangeDocumentNumber,
  onChangePageNumber,
  onChangeBookNumber,
  onClear,
}: DocumentsFilterSheetProps) {
  const filterSheet = useDocumentsFilterSheet({
    visible,
    statusOptions,
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

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={filterSheet.bottomSheetRef}
        index={0}
        snapPoints={filterSheet.snapPoints}
        onClose={onClose}
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
            <DocumentsFilterTopBar onBack={onClose} />

            <DocumentsFilterHeader />

            <DocumentsFilterSection active={filterSheet.isStatusDropdownOpen}>
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
            </DocumentsFilterSection>

            <DocumentsFilterDateSection
              selectedDate={selectedDate}
              selectedDateLabel={filterSheet.selectedDateLabel}
              isDatePickerOpen={filterSheet.isDatePickerOpen}
              onOpenDatePicker={filterSheet.openDatePicker}
              onChangeDate={onChangeDate}
              onDatePickerChange={filterSheet.handleDateChange}
            />

            <DocumentsFilterSection active={false}>
              <Text style={styles.sectionTitle}>Document No.</Text>
              <BottomSheetTextInput
                style={styles.textInput}
                value={documentNumberFilter}
                onChangeText={onChangeDocumentNumber}
                placeholder="Enter Document No."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </DocumentsFilterSection>

            <DocumentsFilterSection active={false}>
              <Text style={styles.sectionTitle}>Page No.</Text>
              <BottomSheetTextInput
                style={styles.textInput}
                value={pageNumberFilter}
                onChangeText={onChangePageNumber}
                placeholder="Enter Page No."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </DocumentsFilterSection>

            <DocumentsFilterSection active={false}>
              <Text style={styles.sectionTitle}>Book No.</Text>
              <BottomSheetTextInput
                style={styles.textInput}
                value={bookNumberFilter}
                onChangeText={onChangeBookNumber}
                placeholder="Enter Book No."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </DocumentsFilterSection>
          </BottomSheetScrollView>

          <DocumentsFilterFooter
            bottomInset={filterSheet.insets.bottom}
            onClear={onClear}
            onDone={onClose}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
