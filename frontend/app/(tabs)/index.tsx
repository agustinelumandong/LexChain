import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { BottomNav } from '@/shared/components/ui/bottom-nav';

const COLORS = {
  bg: '#F3F8FF',
  surface: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  surfaceSuccess: '#EAF8F0',
  surfaceWarning: '#FFF4DD',
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
  warning: '#D28B00',
};

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
}: DocumentRowProps) {
  return (
    <View style={docStyles.row}>
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
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

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
            <Text style={styles.description}>Your documents and access.</Text>
          </View>

          <View style={styles.kpiRow}>
            <KpiCard
              label="Documents"
              value="124"
              meta="+8 this week"
              tone="positive"
            />
            <KpiCard
              label="Active grants"
              value="53"
              meta="2 need review"
              tone="positive"
            />
          </View>

          <View style={styles.searchGroup}>
            <Text style={styles.sectionLabel}>Search</Text>
            <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/documents')}>
              <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
              <Text style={styles.searchPlaceholder}>Search by keyword, date, and etc.</Text>
            </Pressable>
          </View>

          <View style={styles.recentGroup}>
            <Text style={styles.recentTitle}>Recent documents</Text>
            <DocumentRow
              title="Deed of Sale #1002"
              subtitle="Summary ready"
              badgeLabel="MATCH"
              badgeTone="match"
            />
            <DocumentRow
              title="MOA-2026-08"
              subtitle="Integrity warning"
              badgeLabel="REVIEW"
              badgeTone="review"
            />
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  headerBlock: {
    gap: 12,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchGroup: {
    gap: 6,
  },
  sectionLabel: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  searchBar: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  recentGroup: {
    gap: 12,
  },
  recentTitle: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});

const kpiStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    shadowColor: '#133B73',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  value: {
    color: COLORS.navy,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  metaDotPositive: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  metaDotWarning: {
    backgroundColor: COLORS.surfaceWarning,
  },
  meta: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

const docStyles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMatch: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  badgeReview: {
    backgroundColor: COLORS.surfaceWarning,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  badgeLabelMatch: {
    color: COLORS.primary,
  },
  badgeLabelReview: {
    color: COLORS.warning,
  },
});
