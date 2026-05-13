import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import { AdminDataTable, type AdminDataTableColumn } from '../components/AdminDataTable';
import { AdminScreenShell } from './admin-screen-shell';

type AdminResourceScreenProps<T> = {
  title: string;
  subtitle: string;
  notice?: string;
  isLoading: boolean;
  error: unknown;
  data?: T[];
  columns: AdminDataTableColumn<T>[];
  getRowKey: (row: T) => string;
  children?: ReactNode;
};

export function AdminResourceScreen<T>({
  title,
  subtitle,
  notice,
  isLoading,
  error,
  data,
  columns,
  getRowKey,
  children,
}: AdminResourceScreenProps<T>) {
  return (
    <AdminScreenShell title={title} subtitle={subtitle}>
      {notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Access boundary</Text>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      {children}

      {isLoading ? <LoadingState message={`Loading ${title.toLowerCase()}...`} /> : null}
      {error ? <ErrorState title={`Unable to load ${title.toLowerCase()}`} /> : null}
      {data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AdminDataTable<T>
            rows={data}
            getRowKey={getRowKey}
            columns={columns}
          />
        </ScrollView>
      ) : null}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: APP_COLORS.surfaceSoft,
    gap: 6,
    padding: 16,
  },
  noticeTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  noticeText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
