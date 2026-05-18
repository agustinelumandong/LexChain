import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  DOCUMENTS_FILTER_COLORS as COLORS,
  documentsFilterStyles as styles,
} from './documents-filter-sheet.styles';

type DocumentsFilterDateSectionProps = {
  selectedDate: Date | null;
  selectedDateLabel: string;
  isDatePickerOpen: boolean;
  onOpenDatePicker: () => void;
  onChangeDate: (value: Date | null) => void;
  onDatePickerChange: (event: DateTimePickerEvent, nextDate?: Date) => void;
};

export function DocumentsFilterDateSection({
  selectedDate,
  selectedDateLabel,
  isDatePickerOpen,
  onOpenDatePicker,
  onChangeDate,
  onDatePickerChange,
}: DocumentsFilterDateSectionProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date</Text>

        <Pressable style={styles.fieldRow} onPress={onOpenDatePicker}>
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
          onChange={onDatePickerChange}
        />
      ) : null}
    </>
  );
}
