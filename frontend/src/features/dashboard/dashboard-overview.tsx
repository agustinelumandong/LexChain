import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BottomNav } from '@/ui';

import { DashboardKpiCard } from './dashboard-kpi-card';
import { DashboardRecentList } from './dashboard-recent-list';
import { COLORS, styles } from './dashboard-overview.styles';
import { useDashboard } from './use-dashboard';

export function DashboardOverview() {
  const router = useRouter();
  const dashboardStats = useDashboard();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>USER DASHBOARD</Text>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.description}>
              Track your documents, access grants, and review activity.
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(80).springify()}>
              <DashboardKpiCard
                label="Documents"
                value={`${dashboardStats.documentsCount}`}
                meta={`${dashboardStats.verifiedCount} verified`}
                tone={dashboardStats.verifiedCount > 0 ? 'positive' : 'warning'}
              />
            </Animated.View>
            <Animated.View style={styles.kpiItem} entering={FadeInDown.delay(140).springify()}>
              <DashboardKpiCard
                label="Active grants"
                value={`${dashboardStats.activeGrantsCount}`}
                meta={`${dashboardStats.reviewNeededCount} need review`}
                tone={dashboardStats.reviewNeededCount > 0 ? 'warning' : 'positive'}
              />
            </Animated.View>
          </View>

          <View style={styles.searchGroup}>
            <Text style={styles.sectionLabel}>Search</Text>
            <Pressable
              style={({ pressed }) => [
                styles.searchBar,
                pressed && styles.searchBarPressed,
              ]}
              onPress={() => router.push('/(tabs)/documents')}
            >
              <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
              <Text style={styles.searchPlaceholder}>Search by title, party, or date</Text>
            </Pressable>
          </View>

          <DashboardRecentList
            documents={dashboardStats.recentDocuments}
            onPressDocument={() => router.push('/(tabs)/documents')}
          />
        </ScrollView>

        <View style={styles.navWrap}>
          <BottomNav
            activeTab="home"
            onPressHome={() => {}}
            onPressDocuments={() => router.push('/(tabs)/documents')}
            onPressProfile={() => router.push('/(tabs)/profile')}
            onPressUpload={() => router.push('/upload')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
