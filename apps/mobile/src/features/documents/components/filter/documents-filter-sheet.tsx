import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectDropdownField } from '@/ui';

import { DocumentsFilterDateSection } from './documents-filter-date-section';
import { DocumentsFilterFooter } from './documents-filter-footer';
import { DocumentsFilterHeader } from './documents-filter-header';
import { DocumentsFilterSection } from './documents-filter-section';
import { documentsFilterStyles as styles } from './documents-filter-sheet.styles';
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
  onClose: () => void;
  onChangeStatus: (value: string) => void;
  onChangeDate: (value: Date | null) => void;
  onClear: () => void;
};

export function DocumentsFilterSheet({
  visible,
  statusOptions,
  selectedStatus,
  selectedDate,
  onClose,
  onChangeStatus,
  onChangeDate,
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
