import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import { WebsiteLinkButton } from '@/features/website';

import { VerificationResultCard } from '../components/VerificationResultCard';
import { usePublicVerification } from '../hooks';

type PublicVerifyWebScreenProps = {
  code?: string | string[];
};

function normalizeCode(code?: string | string[]) {
  return Array.isArray(code) ? code[0] : code;
}

function isNotImplemented(error: unknown) {
  return error instanceof Error && error.message === 'NOT_IMPLEMENTED';
}

export function PublicVerifyWebScreen({ code }: PublicVerifyWebScreenProps) {
  const verificationCode = normalizeCode(code);
  const { data, isLoading, error } = usePublicVerification(verificationCode);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.logo}>LexChain</Text>
          <Text style={styles.subtitle}>Public document verification portal</Text>
        </View>

        <View style={styles.panel}>
          {!verificationCode ? (
            <EmptyState
              title="Verification code missing"
              message="Use a LexChain public verification link to check a document."
            />
          ) : null}

          {isLoading ? (
            <LoadingState message="Checking verification record..." />
          ) : null}

          {error && isNotImplemented(error) ? (
            <EmptyState
              title="Code verification coming soon"
              message="This verification link is not yet supported. Upload your PDF on the verification page to check a document."
            />
          ) : error ? (
            <EmptyState
              title="Unable to verify"
              message="Something went wrong. Please try again later."
            />
          ) : null}

          {data ? <VerificationResultCard result={data} /> : null}

          <View style={styles.actions}>
            <WebsiteLinkButton
              href="/public/verify"
              label="Verify a document"
              variant="secondary"
            />
            <WebsiteLinkButton href="/" label="Go to LexChain" />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 42,
    gap: 28,
  },
  brand: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 760,
    gap: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
});
