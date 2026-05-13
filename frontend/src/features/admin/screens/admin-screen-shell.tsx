import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';

import { AdminSidebar } from '../components/AdminSidebar';

type AdminScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AdminScreenShell({
  title,
  subtitle,
  children,
}: AdminScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.layout}>
        <AdminSidebar />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LexChain Super Admin</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function formatAdminDate(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    width: '100%',
    maxWidth: 1180,
    padding: 28,
    gap: 22,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
