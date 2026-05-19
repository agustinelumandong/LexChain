import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BottomNav } from '@/ui';
import {
  queryKeys,
  useUnreadNotificationCount,
  useUserProfile,
} from '@/services/query';
import type { SupabaseUser } from '@/types';

import { DashboardKpiCard, DashboardKpiSkeleton } from './dashboard-kpi-card';
import { COLORS, styles } from './dashboard-overview.styles';
import { useDashboard } from './use-dashboard';
import { getProfileDisplayName, useProfileSettingsStore } from '@/features/profile';

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
  const dashboardStats = useDashboard();
  const userProfileQuery = useUserProfile();
  const unreadNotificationCountQuery = useUnreadNotificationCount();
  const userProfile = userProfileQuery.data;
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

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <View style={styles.headerTopLine}>
              <View style={styles.headerCopy}>
                <Text style={styles.title} numberOfLines={2}>
                  Good morning, {displayName}
                </Text>
                <Text style={styles.description}>
                  Manage and verify your legal documents
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

          <View style={styles.kpiRow}>
            <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(80).springify()}>
              {dashboardStats.isLoading ? (
                <DashboardKpiSkeleton />
              ) : (
                <DashboardKpiCard
                  label="Total Documents"
                  value={`${dashboardStats.documentsCount}`}
                  tone={dashboardStats.documentsCount > 0 ? 'positive' : 'warning'}
                />
              )}
            </Animated.View>
            <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(140).springify()}>
              {dashboardStats.isLoading ? (
                <DashboardKpiSkeleton />
              ) : (
                <DashboardKpiCard
                  label="Processing"
                  value={`${dashboardStats.processingCount}`}
                  tone={dashboardStats.processingCount > 0 ? 'warning' : 'positive'}
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
                  label="Anchored On-Chain"
                  value={`${dashboardStats.anchoredOnChainCount}`}
                  tone={dashboardStats.anchoredOnChainCount > 0 ? 'positive' : 'warning'}
                />
              )}
            </Animated.View>
            <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(260).springify()}>
              {dashboardStats.isLoading ? (
                <DashboardKpiSkeleton />
              ) : (
                <DashboardKpiCard
                  label="Pending Invitations / Shared Documents"
                  value={`${dashboardStats.pendingSharedDocumentsCount}`}
                  tone={
                    dashboardStats.pendingSharedDocumentsCount > 0 ? 'warning' : 'positive'
                  }
                />
              )}
            </Animated.View>
          </View>

          <View style={styles.activityGroup}>
            <Text style={styles.activityHeading}>Recent Activity</Text>
            {dashboardStats.recentActivities.length > 0 ? (
              dashboardStats.recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityRow}>
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
                </View>
              ))
            ) : (
              <View style={styles.activityRow}>
                <Text style={styles.activityText}>No recent activity yet</Text>
                <Text style={styles.activityDetail}>
                  Upload, share, or anchor a document to see updates here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.navWrap}>
          <BottomNav
            activeTab="home"
            onPressHome={() => {}}
            onPressDocuments={() => router.push('/(tabs)/documents')}
            onPressProfile={() => router.push('/(tabs)/profile')}
            onPressUpload={() => router.push('/upload')}
            showUpload={account.role.toLowerCase() !== 'viewer'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
