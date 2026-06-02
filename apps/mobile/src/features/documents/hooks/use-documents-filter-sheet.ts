import BottomSheet from '@gorhom/bottom-sheet';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FilterOption } from '../components/filter/documents-filter-sheet';

type UseDocumentsFilterSheetParams = {
  visible: boolean;
  statusOptions: FilterOption[];
  selectedStatus: string;
  selectedDate: Date | null;
  onChangeDate: (value: Date | null) => void;
};

export function useDocumentsFilterSheet({
  visible,
  statusOptions,
  selectedStatus,
  selectedDate,
  onChangeDate,
}: UseDocumentsFilterSheetParams) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['88%'], []);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsStatusDropdownOpen(false);
      setIsDatePickerOpen(false);
    }
  }, [visible]);

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

  const toggleStatusDropdown = () => {
    setIsDatePickerOpen(false);
    setIsStatusDropdownOpen((currentValue) => !currentValue);
  };

  const openDatePicker = () => {
    setIsStatusDropdownOpen(false);
    setIsDatePickerOpen(true);
  };

  const closeDropdowns = () => {
    setIsStatusDropdownOpen(false);
  };

  const closeStatusDropdown = () => {
    setIsStatusDropdownOpen(false);
  };

  return {
    bottomSheetRef,
    insets,
    snapPoints,
    isStatusDropdownOpen,
    isDatePickerOpen,
    selectedStatusLabel,
    selectedDateLabel,
    handleDateChange,
    toggleStatusDropdown,
    openDatePicker,
    closeDropdowns,
    closeStatusDropdown,
  };
}
