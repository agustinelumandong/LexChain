import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { parseApiError } from '@/shared/utils/api-error';
import {
  useAcceptDocumentInvitation,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  usePendingDocumentInvitations,
  useRejectDocumentInvitation,
  useUnreadNotificationCount,
} from '@/services/query';
import type { DocumentInvitationResponse, NotificationResponse } from '@/services/api';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';

import {
  notificationScreenStyles as styles,
} from './notifications-screen.styles';

const HEADER_CONTENT_GAP = 12;

function formatNotificationTime(value: string) {
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

function formatNotificationType(value: NotificationResponse['type']) {
  return value.replaceAll('_', ' ');
}

function getNotificationDocumentId(notification: NotificationResponse) {
  const documentId = notification.event_metadata?.document_id;

  return typeof documentId === 'string' && documentId.trim()
    ? documentId.trim()
    : null;
}

type NotificationRowProps = {
  notification: NotificationResponse;
  isMarkingRead: boolean;
  onPress: (notification: NotificationResponse) => void;
};

function NotificationRow({
  notification,
  isMarkingRead,
  onPress,
}: NotificationRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={notification.is_read || isMarkingRead}
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.row,
        !notification.is_read && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.rowTopLine}>
        <View style={styles.rowCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        {!notification.is_read ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.metaLine}>
        <Text style={styles.typePill} numberOfLines={1}>
          {formatNotificationType(notification.type)}
        </Text>
        <Text style={styles.time} numberOfLines={1}>
          {formatNotificationTime(notification.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

type InvitationRowProps = {
  invitation: DocumentInvitationResponse;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (invitation: DocumentInvitationResponse) => void;
  onReject: (invitation: DocumentInvitationResponse) => void;
};

function InvitationRow({
  invitation,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: InvitationRowProps) {
  const isBusy = isAccepting || isRejecting;

  return (
    <View style={styles.invitationRow}>
      <View style={styles.rowCopy}>
        <Text style={styles.title} numberOfLines={1}>
          {invitation.document_title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          Invited as {invitation.role}. Sent {formatNotificationTime(invitation.created_at)}.
        </Text>
      </View>

      <View style={styles.invitationActions}>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => onReject(invitation)}
          style={({ pressed }) => [
            styles.invitationButton,
            styles.invitationRejectButton,
            pressed && styles.rowPressed,
            isBusy && styles.invitationButtonDisabled,
          ]}
        >
          <Text style={[styles.invitationButtonText, styles.invitationRejectText]}>
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => onAccept(invitation)}
          style={({ pressed }) => [
            styles.invitationButton,
            styles.invitationAcceptButton,
            pressed && styles.rowPressed,
            isBusy && styles.invitationButtonDisabled,
          ]}
        >
          <Text style={[styles.invitationButtonText, styles.invitationAcceptText]}>
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(126);
  const notificationsQuery = useNotifications({ limit: 50, offset: 0, unreadOnly: false });
  const invitationsQuery = usePendingDocumentInvitations();
  const unreadCountQuery = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const acceptInvitationMutation = useAcceptDocumentInvitation();
  const rejectInvitationMutation = useRejectDocumentInvitation();
  const notifications = notificationsQuery.data?.notifications ?? [];
  const invitations = invitationsQuery.data ?? [];
  const notificationData = notificationsQuery.isLoading ? [] : notifications;
  const unreadCount = unreadCountQuery.data?.unread ?? 0;
  const hasUnread = unreadCount > 0;
  const isRefreshing = notificationsQuery.isRefetching || unreadCountQuery.isRefetching;
  const hasInvitations = invitations.length > 0;

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  const handlePressNotification = async (notification: NotificationResponse) => {
    const documentId = getNotificationDocumentId(notification);

    try {
      if (!notification.is_read) {
        await markReadMutation.mutateAsync(notification.id);
      }

      if (documentId) {
        router.push(`/document/${documentId}`);
      }
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleMarkAllRead = async () => {
    if (!hasUnread || markAllReadMutation.isPending) {
      return;
    }

    try {
      await markAllReadMutation.mutateAsync();
      toast.success('Notifications marked as read');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleAcceptInvitation = async (invitation: DocumentInvitationResponse) => {
    try {
      await acceptInvitationMutation.mutateAsync({
        documentId: invitation.document_id,
      });
      toast.success('Invitation accepted');
      router.push(`/document/${invitation.document_id}`);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleRejectInvitation = async (invitation: DocumentInvitationResponse) => {
    try {
      await rejectInvitationMutation.mutateAsync({
        documentId: invitation.document_id,
      });
      toast.success('Invitation rejected');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleRefresh = useCallback(() => {
    void Promise.all([
      notificationsQuery.refetch(),
      invitationsQuery.refetch(),
      unreadCountQuery.refetch(),
    ]);
  }, [invitationsQuery, notificationsQuery, unreadCountQuery]);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        eyebrow="ACTIVITY"
        title="Notifications"
        subtitle="Track document processing, access changes, and blockchain updates."
        onPressLeft={() => router.back()}
        onHeightChange={handleHeaderHeightChange}
        includeTopInset
      />

      <FlatList
        data={notificationData}
        keyExtractor={(notification) => notification.id}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            isMarkingRead={markReadMutation.isPending}
            onPress={handlePressNotification}
          />
        )}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + HEADER_CONTENT_GAP },
        ]}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            {invitationsQuery.isLoading ? (
              <LoadingState message="Loading invitations..." />
            ) : invitationsQuery.error ? (
              <ErrorState
                title="Unable to load invitations"
                message={parseApiError(invitationsQuery.error).message}
                onRetry={() => {
                  void invitationsQuery.refetch();
                }}
              />
            ) : hasInvitations ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryTitle}>Pending invitations</Text>
                    <Text style={styles.summaryText}>
                      Accept or reject shared document access.
                    </Text>
                  </View>
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {invitations.length > 99 ? '99+' : invitations.length}
                    </Text>
                  </View>
                </View>

                {invitations.map((invitation) => (
                  <InvitationRow
                    key={invitation.id}
                    invitation={invitation}
                    isAccepting={acceptInvitationMutation.isPending}
                    isRejecting={rejectInvitationMutation.isPending}
                    onAccept={handleAcceptInvitation}
                    onReject={handleRejectInvitation}
                  />
                ))}
              </View>
            ) : null}

            <View style={styles.summaryCard}>
              <View style={styles.summaryTopLine}>
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
                {hasUnread ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={markAllReadMutation.isPending}
                    onPress={handleMarkAllRead}
                    style={({ pressed }) => [
                      styles.markAllButton,
                      pressed && styles.markAllButtonPressed,
                    ]}
                  >
                    <Text style={styles.markAllText}>
                      {markAllReadMutation.isPending ? 'Marking...' : 'Mark all read'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          notificationsQuery.isLoading ? (
            <LoadingState message="Loading notifications..." />
          ) : notificationsQuery.error ? (
            <ErrorState
              title="Unable to load notifications"
              message={parseApiError(notificationsQuery.error).message}
              onRetry={() => {
                void notificationsQuery.refetch();
                void unreadCountQuery.refetch();
              }}
            />
          ) : hasInvitations ? null : (
            <EmptyState
              title="No notifications yet"
              message="Document processing, sharing, and on-chain updates will appear here."
            />
          )
        }
      />
    </SafeAreaView>
  );
}
