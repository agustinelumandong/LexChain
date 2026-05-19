import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BottomNav } from '@/ui';

import { DashboardKpiCard, DashboardKpiSkeleton } from './dashboard-kpi-card';
import { styles } from './dashboard-overview.styles';
import { useDashboard } from './use-dashboard';
import { useProfileSettingsStore } from '@/features/profile';

const RECENT_ACTIVITY = [
  {
    title: 'Deed of Sale.pdf was anchored',
    detail: 'Blockchain record confirmed and ready for verification.',
    time: 'Today, 9:42 AM',
    status: 'Anchored',
    tone: 'success',
  },
  {
    title: 'Lease Agreement is still processing',
    detail: 'OCR extraction and hash preparation are still running.',
    time: 'Today, 9:18 AM',
    status: 'Processing',
    tone: 'warning',
  },
  {
    title: 'Juan Dela Cruz accepted invite',
    detail: 'Viewer access granted for shared document review.',
    time: 'Yesterday, 4:05 PM',
    status: 'Accepted',
    tone: 'info',
  },
] as const;

const ACTIVITY_STATUS_STYLES = {
  success: styles.activityStatusSuccess,
  warning: styles.activityStatusWarning,
  info: styles.activityStatusInfo,
};

export function DashboardOverview() {
  const router = useRouter();
  const account = useProfileSettingsStore((state) => state.account);
  const dashboardStats = useDashboard();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Good morning, Atty. Reyes</Text>
            <Text style={styles.description}>
              Manage and verify your legal documents
            </Text>
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
            {RECENT_ACTIVITY.map((activity) => (
              <View key={activity.title} style={styles.activityRow}>
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
            ))}
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
