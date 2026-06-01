import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AuditLogResponse } from '@/services/api';
import { EmptyState, ErrorState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import {
  formatAuditAction,
  formatAuditDetails,
  formatAuditTime,
  sortAuditLogsNewestFirst,
} from '@/features/document/utils/audit-log-formatters';

type AuditTrailSheetProps = {
  errorMessage?: string;
  isLoading: boolean;
  logs: AuditLogResponse[];
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export function AuditTrailSheet({
  errorMessage,
  isLoading,
  logs,
  visible,
  onClose,
  onRetry,
}: AuditTrailSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['68%'], []);
  const sortedLogs = useMemo(() => sortAuditLogsNewestFirst(logs), [logs]);

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
    <View style={styles.overlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.overlay}
        onClose={onClose}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>AUDIT TRAIL</Text>
            <Text style={styles.title}>Document activity</Text>
            <Text style={styles.description}>
              Review recorded changes, access updates, and blockchain events.
            </Text>
          </View>

          {isLoading ? <LoadingState message="Loading audit trail..." /> : null}

          {!isLoading && errorMessage ? (
            <ErrorState
              title="Unable to load audit trail"
              message={errorMessage}
              onRetry={onRetry}
            />
          ) : null}

          {!isLoading && !errorMessage && sortedLogs.length === 0 ? (
            <EmptyState title="No audit events yet" />
          ) : null}

          {!isLoading && !errorMessage && sortedLogs.length > 0 ? (
            <View style={styles.timeline}>
              {sortedLogs.map((log, index) => {
                const isLast = index === sortedLogs.length - 1;
                const detailsText = formatAuditDetails(log.details);

                return (
                  <View key={log.id} style={styles.row}>
                    <View style={styles.lineColumn}>
                      <View style={styles.dot}>
                        <MaterialIcons name="done" size={12} color={APP_COLORS.white} />
                      </View>
                      {!isLast ? <View style={styles.line} /> : null}
                    </View>

                    <View style={styles.rowContent}>
                      <Text style={styles.action}>{formatAuditAction(log.action)}</Text>
                      <Text style={styles.meta}>
                        {formatAuditTime(log.created_at)}
                        {log.user_id ? ` • Actor ${log.user_id.slice(0, 8)}` : ''}
                      </Text>
                      {detailsText ? (
                        <Text style={styles.details}>{detailsText}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  backdrop: {
    backgroundColor: 'rgba(7, 22, 43, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: APP_COLORS.white,
  },
  handle: {
    backgroundColor: APP_COLORS.borderSoft,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  description: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  timeline: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  lineColumn: {
    alignItems: 'center',
    width: 22,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 58,
    backgroundColor: APP_COLORS.borderSoft,
  },
  rowContent: {
    flex: 1,
    paddingBottom: 18,
    gap: 5,
  },
  action: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  meta: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  details: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
