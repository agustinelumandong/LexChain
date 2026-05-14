import { MaterialIcons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const LINKS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'grid-view' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Document Issuers', href: '/admin/document-issuers', icon: 'business' },
  { label: 'Documents', href: '/admin/documents', icon: 'description' },
  { label: 'Categories', href: '/admin/categories', icon: 'category' },
  {
    label: 'Invitations & Permissions',
    href: '/admin/invitations-permissions',
    icon: 'admin-panel-settings',
  },
  { label: 'Verification Logs', href: '/admin/verification-logs', icon: 'verified-user' },
  { label: 'Blockchain Records', href: '/admin/blockchain-records', icon: 'account-tree' },
  { label: 'OCR / NLP Processing', href: '/admin/ocr-nlp-processing', icon: 'document-scanner' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'manage-search' },
  { label: 'System Settings', href: '/admin/system-settings', icon: 'settings' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.logoMark}>
          <MaterialIcons name="shield" size={24} color={APP_COLORS.white} />
        </View>
        <View>
          <Text style={styles.brand}>LexChain</Text>
          <Text style={styles.caption}>Super Admin</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.nav} showsVerticalScrollIndicator={false}>
        {LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href} style={[styles.link, isActive && styles.linkActive]}>
              <MaterialIcons
                name={link.icon}
                size={20}
                color={isActive ? '#111827' : '#A7B4C4'}
              />
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                {link.label}
              </Text>
              <View style={[styles.activeRail, isActive && styles.activeRailVisible]} />
            </Link>
          );
        })}
      </ScrollView>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <MaterialIcons name="verified-user" size={18} color={APP_COLORS.primary} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>System owner</Text>
          <Text style={styles.statusText}>Demo monitoring mode</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 292,
    gap: 30,
    borderRightWidth: 1,
    borderRightColor: '#E8F0F8',
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 26,
  },
  brandBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 52,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brand: {
    color: '#111827',
    fontFamily: fonts.regular,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
  },
  caption: {
    color: '#9AA8B8',
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nav: {
    gap: 2,
    paddingBottom: 12,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 14,
    minHeight: 44,
    paddingLeft: 22,
    paddingRight: 12,
    paddingVertical: 8,
  },
  linkActive: {
    backgroundColor: '#EEF4FB',
  },
  activeRail: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 26,
    width: 5,
  },
  activeRailVisible: {
    backgroundColor: APP_COLORS.primary,
  },
  linkText: {
    color: '#A0AAB8',
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  linkTextActive: {
    color: '#111827',
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: '#F5FAFF',
    borderColor: '#E4EEF9',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.white,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    color: '#111827',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  statusText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
});
