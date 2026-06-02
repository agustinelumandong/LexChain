import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import type { DocumentInvitationResponse } from '@/services/api';
import {
  useAcceptDocumentInvitation,
  usePendingDocumentInvitations,
  useRejectDocumentInvitation,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';

import { invitationScreenStyles as styles } from './invitations-screen.styles';

const HEADER_CONTENT_GAP = 12;
const DEFAULT_HEADER_HEIGHT = 160;

function formatInvitationTime(value: string) {
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

type InvitationCardProps = {
  invitation: DocumentInvitationResponse;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (invitation: DocumentInvitationResponse) => void;
  onReject: (invitation: DocumentInvitationResponse) => void;
};

function InvitationCard({
  invitation,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: InvitationCardProps) {
  const isBusy = isAccepting || isRejecting;

  return (
    <View style={styles.card}>
      <View style={styles.topLine}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {invitation.document_title}
          </Text>
          <Text style={styles.body}>
            Sent {formatInvitationTime(invitation.created_at)}
          </Text>
        </View>

        <Text style={styles.rolePill} numberOfLines={1}>
          {invitation.role}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => onReject(invitation)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.rejectButton,
            pressed && styles.cardPressed,
            isBusy && styles.disabledButton,
          ]}
        >
          <Text style={[styles.actionText, styles.rejectText]}>
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => onAccept(invitation)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.acceptButton,
            pressed && styles.cardPressed,
            isBusy && styles.disabledButton,
          ]}
        >
          <Text style={[styles.actionText, styles.acceptText]}>
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function InvitationsScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const invitationsQuery = usePendingDocumentInvitations();
  const acceptInvitationMutation = useAcceptDocumentInvitation();
  const rejectInvitationMutation = useRejectDocumentInvitation();
  const invitations = invitationsQuery.data ?? [];

  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  const handleAcceptInvitation = async (invitation: DocumentInvitationResponse) => {
    try {
      await acceptInvitationMutation.mutateAsync({
        documentId: invitation.document_id,
      });
      toast.success('Invitation accepted');
      router.replace(`/document/${invitation.document_id}`);
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

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        eyebrow="DOCUMENTS"
        title="Invitations"
        subtitle="Accept or reject document access requests."
        onPressLeft={() => router.back()}
        onHeightChange={handleHeaderHeightChange}
        includeTopInset
      />

      <FlatList
        data={invitationsQuery.isLoading ? [] : invitations}
        keyExtractor={(invitation) => invitation.id}
        renderItem={({ item }) => (
          <InvitationCard
            invitation={item}
            isAccepting={acceptInvitationMutation.isPending}
            isRejecting={rejectInvitationMutation.isPending}
            onAccept={handleAcceptInvitation}
            onReject={handleRejectInvitation}
          />
        )}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + HEADER_CONTENT_GAP },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={invitationsQuery.isRefetching}
        onRefresh={() => {
          void invitationsQuery.refetch();
        }}
        ListEmptyComponent={
          invitationsQuery.isLoading ? (
            <LoadingState message="Loading invitations..." />
          ) : invitationsQuery.error ? (
            <ErrorState
              title="Unable to load invitations"
              message={parseApiError(invitationsQuery.error).message}
              onRetry={() => {
                void invitationsQuery.refetch();
              }}
            />
          ) : (
            <EmptyState
              title="No pending invitations"
              message="Document access requests will appear here."
            />
          )
        }
        progressViewOffset={headerHeight + HEADER_CONTENT_GAP}
      />
    </SafeAreaView>
  );
}
