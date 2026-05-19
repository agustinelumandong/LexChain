import BottomSheet from '@gorhom/bottom-sheet';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FilterOption } from '../components/filter/documents-filter-sheet';

type UseDocumentsFilterSheetParams = {
  visible: boolean;
  typeOptions: FilterOption[];
  statusOptions: FilterOption[];
  selectedType: string;
  selectedStatus: string;
  selectedDate: Date | null;
  onChangeDate: (value: Date | null) => void;
};

export function useDocumentsFilterSheet({
  visible,
  typeOptions,
  statusOptions,
  selectedType,
  selectedStatus,
  selectedDate,
  onChangeDate,
}: UseDocumentsFilterSheetParams) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['88%'], []);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsTypeDropdownOpen(false);
      setIsStatusDropdownOpen(false);
      setIsDatePickerOpen(false);
    }
  }, [visible]);

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

  const closeTypeDropdown = () => {
    setIsTypeDropdownOpen(false);
  };

  const closeStatusDropdown = () => {
    setIsStatusDropdownOpen(false);
  };

  return {
    bottomSheetRef,
    insets,
    snapPoints,
    isTypeDropdownOpen,
    isStatusDropdownOpen,
    isDatePickerOpen,
    selectedTypeLabel,
    selectedStatusLabel,
    selectedDateLabel,
    handleDateChange,
    toggleTypeDropdown,
    toggleStatusDropdown,
    openDatePicker,
    closeDropdowns,
    closeTypeDropdown,
    closeStatusDropdown,
  };
}
