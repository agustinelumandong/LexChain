import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import { WebsiteLinkButton } from './WebsiteLinkButton';
import { WebStoreButtons } from './WebStoreButtons';

export function WebHero() {
  return (
    <View style={styles.section}>
      <View style={styles.blob} />
      <View style={styles.inner}>
        <View style={styles.badge}>
          <MaterialIcons name="verified-user" size={14} color="#0770c4" />
          <Text style={styles.badgeText}>BLOCKCHAIN-POWERED DOCUMENT VERIFICATION</Text>
        </View>
        <Text style={styles.title}>
          Find, understand, share, and verify legal documents with absolute confidence.
        </Text>
        <Text style={styles.subtitle}>
          LexChain helps document issuers, law offices, organizations, and authorized
          users upload, manage, search, summarize, share, and verify legal documents
          in a secure, searchable, and tamper-evident repository.
        </Text>
        <View style={styles.actions}>
          <WebsiteLinkButton href="/public/verify" label="Verify a Document" />
          <WebsiteLinkButton href="/admin/login" label="Admin Login" variant="secondary" />
        </View>
        <View style={styles.storeSection}>
          <Text style={styles.storeLabel}>DOWNLOAD THE APP</Text>
          <WebStoreButtons />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
    overflow: 'hidden',
    backgroundColor: '#EAF6FF',
  },
  blob: {
    position: 'absolute',
    top: 40,
    left: '50%',
    width: 800,
    height: 320,
    borderRadius: 9999,
    backgroundColor: 'rgba(9,133,231,0.1)',
    // @ts-ignore
    transform: [{ translateX: -400 }],
    // @ts-ignore
    filter: 'blur(80px)',
  },
  inner: {
    position: 'relative',
    maxWidth: 780,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(9,133,231,0.2)',
    backgroundColor: 'rgba(9,133,231,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#0770c4',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: '900',
    textAlign: 'center',
    maxWidth: 700,
  },
  subtitle: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 620,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 8,
  },
  storeSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 24,
  },
  storeLabel: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
