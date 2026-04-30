import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { MOCK_DOCUMENTS } from '@/mocks';
import { BottomNav } from '@/ui';

import { COLORS, docStyles, kpiStyles, styles } from './index.styles';

type KpiCardProps = {
  label: string;
  value: string;
  meta: string;
  tone?: 'positive' | 'warning';
};

type DocumentRowProps = {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeTone: 'match' | 'review';
  onPress?: () => void;
};

function KpiCard({ label, value, meta, tone = 'positive' }: KpiCardProps) {
  return (
    <View style={kpiStyles.card}>
      <Text style={kpiStyles.label}>{label}</Text>
      <Text style={kpiStyles.value}>{value}</Text>
      <View style={kpiStyles.metaRow}>
        <View
          style={[
            kpiStyles.metaDot,
            tone === 'warning' ? kpiStyles.metaDotWarning : kpiStyles.metaDotPositive,
          ]}
        />
        <Text style={kpiStyles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

function DocumentRow({
  title,
  subtitle,
  badgeLabel,
  badgeTone,
  onPress,
}: DocumentRowProps) {
  return (
    <Pressable style={docStyles.row} onPress={onPress}>
      <View style={docStyles.copy}>
        <Text style={docStyles.title}>{title}</Text>
        <Text style={docStyles.subtitle}>{subtitle}</Text>
      </View>

      <View
        style={[
          docStyles.badge,
          badgeTone === 'match' ? docStyles.badgeMatch : docStyles.badgeReview,
        ]}
      >
        <Text
          style={[
            docStyles.badgeLabel,
            badgeTone === 'match' ? docStyles.badgeLabelMatch : docStyles.badgeLabelReview,
          ]}
        >
          {badgeLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const dashboardStats = useMemo(() => {
    const documentsCount = MOCK_DOCUMENTS.length;
    const activeGrantsCount = MOCK_DOCUMENTS.reduce(
      (total, document) => total + document.whitelist.grants.length,
      0,
    );
    const reviewNeededCount = MOCK_DOCUMENTS.filter(
      (document) => document.status === 'review-needed',
    ).length;
    const verifiedCount = MOCK_DOCUMENTS.filter(
      (document) => document.status === 'verified',
    ).length;
    const recentDocuments = [...MOCK_DOCUMENTS]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 3);

    return {
      documentsCount,
      activeGrantsCount,
      reviewNeededCount,
      verifiedCount,
      recentDocuments,
    };
  }, []);

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
            <KpiCard
              label="Documents"
              value={`${dashboardStats.documentsCount}`}
              meta={`${dashboardStats.verifiedCount} verified`}
              tone={dashboardStats.verifiedCount > 0 ? 'positive' : 'warning'}
            />
            <KpiCard
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

          <View style={styles.recentGroup}>
            <Text style={styles.recentTitle}>Recent documents</Text>
            {dashboardStats.recentDocuments.length > 0 ? (
              dashboardStats.recentDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  title={document.title}
                  subtitle={document.status === 'verified' ? 'Summary ready' : 'Integrity warning'}
                  badgeLabel={document.status === 'verified' ? 'MATCH' : 'REVIEW'}
                  badgeTone={document.status === 'verified' ? 'match' : 'review'}
                  onPress={() => router.push('/(tabs)/documents')}
                />
              ))
            ) : (
              <View style={styles.emptyRecentState}>
                <Text style={styles.emptyRecentTitle}>No documents yet</Text>
                <Text style={styles.emptyRecentBody}>
                  Upload your first document to start building your repository.
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
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
