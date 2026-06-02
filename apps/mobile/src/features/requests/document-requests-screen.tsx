import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import type { DocumentRequestResponse } from '@/services/api';
import {
  useDocumentRequests,
  useMyDocumentRequests,
  useReviewDocumentRequest,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS, fonts } from '@/theme';
import { Button, EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';

type DocumentRequestsMode = 'lawyer' | 'mine';
type RequestStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const HEADER_CONTENT_GAP = 12;
const DEFAULT_HEADER_HEIGHT = 160;
const STATUS_FILTERS: { label: string; value: RequestStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function formatRequestDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getStatusTone(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === 'approved') {
    return styles.statusApproved;
  }

  if (normalizedStatus === 'rejected') {
    return styles.statusRejected;
  }

  return styles.statusPending;
}

function getDocumentName(request: DocumentRequestResponse) {
  return request.document_name?.trim() || `Document ${request.document_id.slice(0, 8)}`;
}

function RequestCard({
  mode,
  request,
  onPress,
}: {
  mode: DocumentRequestsMode;
  request: DocumentRequestResponse;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open request for ${getDocumentName(request)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTopLine}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {getDocumentName(request)}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {mode === 'lawyer'
              ? `${request.requester_name} · ${request.requester_email}`
              : formatRequestDate(request.created_at)}
          </Text>
        </View>
        <Text style={[styles.statusPill, getStatusTone(request.status)]} numberOfLines={1}>
          {formatStatus(request.status)}
        </Text>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {request.description}
      </Text>

      {request.status === 'rejected' && request.rejection_reason ? (
        <Text style={styles.rejectionText} numberOfLines={2}>
          Reason: {request.rejection_reason}
        </Text>
      ) : null}

      {mode === 'lawyer' ? (
        <Text style={styles.cardTime}>{formatRequestDate(request.created_at)}</Text>
      ) : null}
    </Pressable>
  );
}

function RequestReviewFooter({
  isReviewing,
  isRejecting,
  onApprove,
  onReject,
  ...props
}: BottomSheetFooterProps & {
  isReviewing: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <BottomSheetFooter {...props} bottomInset={0}>
      <View style={styles.sheetFooter}>
        <Button
          label={isRejecting ? 'Submit rejection' : 'Reject'}
          variant="secondary"
          fullWidth
          disabled={isReviewing}
          onPress={onReject}
        />
        <Button
          label="Approve"
          fullWidth
          disabled={isReviewing || isRejecting}
          loading={isReviewing && !isRejecting}
          onPress={onApprove}
        />
      </View>
    </BottomSheetFooter>
  );
}

function RequestDetailSheet({
  isReviewing,
  mode,
  rejectReason,
  request,
  onApprove,
  onChangeRejectReason,
  onClose,
  onReject,
}: {
  isReviewing: boolean;
  mode: DocumentRequestsMode;
  rejectReason: string;
  request: DocumentRequestResponse | null;
  onApprove: () => void;
  onChangeRejectReason: (value: string) => void;
  onClose: () => void;
  onReject: () => void;
}) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const canReview = mode === 'lawyer' && request?.status === 'pending';
  const snapPoints = useMemo(() => ['62%', '88%'], []);
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) =>
      canReview ? (
        <RequestReviewFooter
          {...props}
          isReviewing={isReviewing}
          isRejecting={rejectReason.length > 0}
          onApprove={onApprove}
          onReject={onReject}
        />
      ) : null,
    [canReview, isReviewing, onApprove, onReject, rejectReason.length],
  );

  if (!request) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.sheetOverlay]} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.sheetContent,
            canReview && styles.sheetContentWithFooter,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetIcon}>
            <MaterialIcons name="request-page" size={26} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.sheetTitle}>{getDocumentName(request)}</Text>
          <Text style={styles.sheetSubtitle}>{request.description}</Text>

          <BottomSheetView style={styles.detailGroup}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.statusPill, getStatusTone(request.status)]}>
              {formatStatus(request.status)}
            </Text>
          </BottomSheetView>
          <BottomSheetView style={styles.detailGroup}>
            <Text style={styles.detailLabel}>Requester</Text>
            <Text style={styles.detailValue}>
              {request.requester_name} · {request.requester_email}
            </Text>
          </BottomSheetView>
          <BottomSheetView style={styles.detailGroup}>
            <Text style={styles.detailLabel}>Submitted</Text>
            <Text style={styles.detailValue}>{formatRequestDate(request.created_at)}</Text>
          </BottomSheetView>

          {request.rejection_reason ? (
            <BottomSheetView style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Rejection reason</Text>
              <Text style={styles.detailValue}>{request.rejection_reason}</Text>
            </BottomSheetView>
          ) : null}

          {canReview ? (
            <BottomSheetView style={styles.rejectBox}>
              <Text style={styles.detailLabel}>Rejection reason</Text>
              <TextInput
                value={rejectReason}
                onChangeText={onChangeRejectReason}
                placeholder="Required when rejecting"
                placeholderTextColor={APP_COLORS.textMuted}
                multiline
                editable={!isReviewing}
                style={styles.rejectInput}
              />
            </BottomSheetView>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

export function DocumentRequestsScreen({ mode }: { mode: DocumentRequestsMode }) {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>('pending');
  const [selectedRequest, setSelectedRequest] =
    useState<DocumentRequestResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const isLawyerMode = mode === 'lawyer';
  const lawyerRequestsQuery = useDocumentRequests(
    statusFilter === 'all' ? undefined : { status: statusFilter },
    isLawyerMode,
  );
  const myRequestsQuery = useMyDocumentRequests(!isLawyerMode);
  const reviewMutation = useReviewDocumentRequest();
  const query = isLawyerMode ? lawyerRequestsQuery : myRequestsQuery;
  const requests = query.data?.requests ?? [];
  const isRefreshing = query.isRefetching || reviewMutation.isPending;

  const handleCloseSheet = () => {
    setSelectedRequest(null);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        requestId: selectedRequest.id,
        payload: { action: 'approve' },
      });
      toast.success('Request approved');
      handleCloseSheet();
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      toast.error('Add a rejection reason first');
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        requestId: selectedRequest.id,
        payload: { action: 'reject', rejection_reason: trimmedReason },
      });
      toast.success('Request rejected');
      handleCloseSheet();
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow={isLawyerMode ? 'REQUEST MANAGEMENT' : 'E-COPY REQUESTS'}
          title={isLawyerMode ? 'Document requests' : 'My requests'}
          subtitle={
            isLawyerMode
              ? 'Review client e-copy requests and record decisions.'
              : 'Track e-copy requests submitted to issuing lawyers.'
          }
          leftAccessibilityLabel="Back"
          onPressLeft={() => router.back()}
          onHeightChange={setHeaderHeight}
          includeTopInset
        />

        <FlatList
          data={query.isLoading ? [] : requests}
          keyExtractor={(request) => request.id}
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void query.refetch();
              }}
              tintColor={APP_COLORS.primary}
              colors={[APP_COLORS.primary]}
              progressViewOffset={headerHeight + HEADER_CONTENT_GAP}
              progressBackgroundColor={APP_COLORS.white}
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isLawyerMode ? (
              <View style={styles.segmentedControl}>
                {STATUS_FILTERS.map((filter) => {
                  const isActive = statusFilter === filter.value;

                  return (
                    <Pressable
                      key={filter.value}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter ${filter.label} requests`}
                      onPress={() => setStatusFilter(filter.value)}
                      style={({ pressed }) => [
                        styles.segment,
                        isActive && styles.segmentActive,
                        pressed && styles.segmentPressed,
                      ]}
                    >
                      <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <RequestCard
              mode={mode}
              request={item}
              onPress={() => {
                setSelectedRequest(item);
                setRejectReason('');
              }}
            />
          )}
          ListEmptyComponent={
            query.isLoading ? (
              <LoadingState message="Loading document requests..." />
            ) : query.error ? (
              <ErrorState
                title="Unable to load requests"
                message={parseApiError(query.error).message}
                onRetry={() => {
                  void query.refetch();
                }}
              />
            ) : (
              <EmptyState
                title={isLawyerMode ? 'No requests found' : 'No e-copy requests yet'}
                message={
                  isLawyerMode
                    ? 'Client e-copy requests will appear here.'
                    : 'Requests you submit from document PDFs will appear here.'
                }
              />
            )
          }
        />
      </View>

      <RequestDetailSheet
        mode={mode}
        request={selectedRequest}
        rejectReason={rejectReason}
        isReviewing={reviewMutation.isPending}
        onChangeRejectReason={setRejectReason}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={handleCloseSheet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 128,
    gap: 12,
  },
  segmentedControl: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  segmentActive: {
    backgroundColor: APP_COLORS.primary,
  },
  segmentPressed: {
    opacity: 0.82,
  },
  segmentText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: APP_COLORS.white,
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 16,
    gap: 10,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  cardTopLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  cardMeta: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  cardDescription: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  cardTime: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusPill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    maxWidth: 96,
  },
  statusPending: {
    backgroundColor: '#FFF4DD',
    color: '#B77900',
  },
  statusApproved: {
    backgroundColor: '#EAF8F0',
    color: APP_COLORS.success,
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
    color: APP_COLORS.danger,
  },
  rejectionText: {
    color: APP_COLORS.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  sheetOverlay: {
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: APP_COLORS.white,
  },
  sheetHandle: {
    backgroundColor: APP_COLORS.borderSoft,
    width: 42,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  sheetContentWithFooter: {
    paddingBottom: 132,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  detailGroup: {
    gap: 6,
  },
  detailLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  detailValue: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  rejectBox: {
    gap: 8,
  },
  rejectInput: {
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  sheetFooter: {
    backgroundColor: APP_COLORS.white,
    borderTopWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 10,
  },
});
