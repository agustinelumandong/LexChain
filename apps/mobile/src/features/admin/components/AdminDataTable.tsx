import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export type AdminDataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => string | number | boolean | null | undefined;
};

type AdminDataTableProps<T> = {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
}: AdminDataTableProps<T>) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {columns.map((column) => (
          <Text key={column.key.toString()} style={[styles.cell, styles.headerCell]}>
            {column.header}
          </Text>
        ))}
      </View>

      {rows.map((row) => (
        <View key={getRowKey(row)} style={styles.row}>
          {columns.map((column) => {
            const value = column.render
              ? column.render(row)
              : (row as Record<string, unknown>)[column.key.toString()];

            const cellValue = value == null ? 'Not available' : String(value);

            return (
              <Text key={column.key.toString()} style={styles.cell}>
                {cellValue}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    minWidth: 720,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.borderSoft,
  },
  cell: {
    flex: 1,
    minWidth: 130,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  headerCell: {
    color: APP_COLORS.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 11,
    lineHeight: 14,
  },
});
