import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import {
  DashboardKpiCard,
  DashboardRecentList,
  useDashboard,
} from '@/features/dashboard';
import { BottomNav } from '@/ui';

import { COLORS, styles } from './index.styles';

export default function HomeScreen() {
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
            <DashboardKpiCard
              label="Documents"
              value={`${dashboardStats.documentsCount}`}
              meta={`${dashboardStats.verifiedCount} verified`}
              tone={dashboardStats.verifiedCount > 0 ? 'positive' : 'warning'}
            />
            <DashboardKpiCard
              label="Active grants"
              value={`${dashboardStats.activeGrantsCount}`}
              meta={`${dashboardStats.reviewNeededCount} need review`}
              tone={dashboardStats.reviewNeededCount > 0 ? 'warning' : 'positive'}
            />
          </View>

          <View style={styles.searchGroup}>
            <Text style={styles.sectionLabel}>Search</Text>
            <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/documents')}>
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
