import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';

import { WebsiteLinkButton } from '../components/WebsiteLinkButton';

export function WebsiteLandingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>LexChain</Text>
          <Text style={styles.title}>
            Verify legal documents with confidence.
          </Text>
          <Text style={styles.subtitle}>
            A public verification portal and secure admin workspace for trusted
            document records.
          </Text>

          <View style={styles.actions}>
            <WebsiteLinkButton href="/public/verify" label="Verify a document" />
            <WebsiteLinkButton href="/admin/login" label="Super Admin" variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  content: {
    minHeight: '100%',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    gap: 18,
  },
  brand: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '900',
    maxWidth: 680,
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    maxWidth: 620,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
  },
});
