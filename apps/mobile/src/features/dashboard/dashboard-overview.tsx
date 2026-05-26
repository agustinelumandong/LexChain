import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  queryKeys,
  useUnreadNotificationCount,
  useUserProfile,
} from '@/services/query';
import type { SupabaseUser } from '@/types';

import { DashboardKpiCard, DashboardKpiSkeleton } from './dashboard-kpi-card';
import { COLORS, styles } from './dashboard-overview.styles';
import { useDashboard } from './use-dashboard';
import {
  canRoleUploadDocuments,
  getProfileDisplayName,
  useProfileSettingsStore,
} from '@/features/profile';

const ACTIVITY_STATUS_STYLES = {
  success: styles.activityStatusSuccess,
  warning: styles.activityStatusWarning,
  info: styles.activityStatusInfo,
};

export function DashboardOverview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const account = useProfileSettingsStore((state) => state.account);
  const currentUser = queryClient.getQueryData<SupabaseUser>(queryKeys.auth.currentUser);
  const userProfileQuery = useUserProfile();
  const userProfile = userProfileQuery.data;
  const isLawyer = canRoleUploadDocuments(userProfile?.role);
  const dashboardStats = useDashboard({ includeMockParticipantInvites: isLawyer });
  const unreadNotificationCountQuery = useUnreadNotificationCount();
  const unreadNotificationCount = unreadNotificationCountQuery.data?.unread ?? 0;
  const userMetadata = currentUser?.user_metadata;
  const authDisplayName = [userMetadata?.f_name, userMetadata?.l_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const profileDisplayName = userProfile
    ? [userProfile.f_name, userProfile.l_name].filter(Boolean).join(' ').trim()
    : '';
  const displayName = profileDisplayName || authDisplayName || getProfileDisplayName(account);
  const dashboardCopy = isLawyer
    ? {
        description: 'Manage and verify your legal documents',
        firstMetric: 'Total Documents',
        secondMetric: 'Processing',
        thirdMetric: 'On Chain Records',
        fourthMetric: 'Pending Invites',
        activityHeading: 'Recent Activity',
        emptyActivity: 'Upload, share, or anchor a document to see updates here.',
      }
    : {
        description: 'View shared documents and verification activity',
        firstMetric: 'Shared Documents',
        secondMetric: 'Owned Documents',
        thirdMetric: 'On Chain Documents',
        fourthMetric: 'Recent Access',
        activityHeading: 'Shared Document Activity',
        emptyActivity: 'Shared documents and verification updates will appear here.',
      };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={dashboardStats.isRefetching}
              onRefresh={() => {
                void dashboardStats.refetch();
              }}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.surface}
            />
          }
        >
          <View style={styles.headerBlock}>
            <View style={styles.headerTopLine}>
              <View style={styles.headerCopy}>
                <Text style={styles.title} numberOfLines={2}>
                  Good morning, {displayName}
                </Text>
                <Text style={styles.description}>
                  {dashboardCopy.description}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open notifications"
                onPress={() => router.push('/notifications')}
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.notificationButtonPressed,
                ]}
              >
                <MaterialIcons name="notifications-none" size={22} color={COLORS.navy} />
                {unreadNotificationCount > 0 ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>

          <View style={styles.kpiGroup}>
            <View style={styles.kpiRow}>
              <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(80).springify()}>
                {dashboardStats.isLoading ? (
                  <DashboardKpiSkeleton />
                ) : (
                  <DashboardKpiCard
                    label={dashboardCopy.firstMetric}
                    value={`${dashboardStats.documentsCount}`}
                    iconName="description"
                  />
                )}
              </Animated.View>
              <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(140).springify()}>
                {dashboardStats.isLoading ? (
                  <DashboardKpiSkeleton />
                ) : (
                  <DashboardKpiCard
                    label={dashboardCopy.secondMetric}
                    value={`${dashboardStats.processingCount}`}
                    iconName="schedule"
                  />
                )}
              </Animated.View>
            </View>
            <View style={styles.kpiRow}>
              <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(200).springify()}>
                {dashboardStats.isLoading ? (
                  <DashboardKpiSkeleton />
                ) : (
                  <DashboardKpiCard
                    label={dashboardCopy.thirdMetric}
                    value={`${dashboardStats.anchoredOnChainCount}`}
                    iconName="verified-user"
                  />
                )}
              </Animated.View>
              <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(260).springify()}>
                {dashboardStats.isLoading ? (
                  <DashboardKpiSkeleton />
                ) : (
                  <DashboardKpiCard
                    label={dashboardCopy.fourthMetric}
                    value={
                      isLawyer
                        ? `${dashboardStats.pendingParticipantInvitesCount}`
                        : `${dashboardStats.recentActivities.length}`
                    }
                    iconName="groups"
                  />
                )}
              </Animated.View>
            </View>
          </View>

          <View style={styles.activityGroup}>
            <Text style={styles.activityHeading}>{dashboardCopy.activityHeading}</Text>
            {dashboardStats.recentActivities.length > 0 ? (
              dashboardStats.recentActivities.map((activity) => {
                const documentId = activity.id.startsWith('document-')
                  ? activity.id.replace('document-', '')
                  : null;

                return (
                  <Pressable
                    key={activity.id}
                    style={({ pressed }) => [
                      styles.activityRow,
                      pressed && documentId && { opacity: 0.7 },
                    ]}
                    onPress={
                      documentId
                        ? () => router.push(`/document/${documentId}`)
                        : undefined
                    }
                  >
                    <View style={styles.activityCopy}>
                      <View style={styles.activityTopLine}>
                        <Text style={styles.activityText} numberOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text
                          style={[
                            styles.activityStatus,
                            ACTIVITY_STATUS_STYLES[activity.tone],
                          ]}
                          numberOfLines={1}
                        >
                          {activity.status}
                        </Text>
                      </View>
                      <Text style={styles.activityDetail} numberOfLines={1}>
                        {activity.detail}
                      </Text>
                      <Text style={styles.activityTime} numberOfLines={1}>
                        {activity.time}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.activityRow}>
                <Text style={styles.activityText}>No recent activity yet</Text>
                <Text style={styles.activityDetail}>
                  {dashboardCopy.emptyActivity}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
