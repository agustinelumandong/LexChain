import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import { parseApiError } from '@/shared/utils/api-error';

import { VerificationResultCard } from '../components/VerificationResultCard';
import { getDemoPublicVerification } from '../api';
import { usePublicVerification } from '../hooks';

type PublicVerifyWebScreenProps = {
  code?: string | string[];
};

function normalizeCode(code?: string | string[]) {
  return Array.isArray(code) ? code[0] : code;
}

export function PublicVerifyWebScreen({ code }: PublicVerifyWebScreenProps) {
  const router = useRouter();
  const verificationCode = normalizeCode(code);
  const verificationQuery = usePublicVerification(verificationCode);
  const result = verificationQuery.data ?? (
    verificationCode ? getDemoPublicVerification(verificationCode) : null
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.logo}>LexChain</Text>
          <Text style={styles.subtitle}>
            Public document verification portal
          </Text>
        </View>

        <View style={styles.panel}>
          {!verificationCode ? (
            <EmptyState
              title="Verification code missing"
              message="Use a LexChain public verification link to check a document."
            />
          ) : null}

          {verificationQuery.isLoading && !result ? (
            <LoadingState message="Checking verification record..." />
          ) : null}

          {verificationQuery.error ? (
            <ErrorState
              title="Unable to verify"
              message={parseApiError(verificationQuery.error).message}
              onRetry={() => {
                void verificationQuery.refetch();
              }}
            />
          ) : null}

          {result ? (
            <VerificationResultCard result={result} />
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Verify another document"
              variant="secondary"
              leftIconName="search"
              onPress={() => router.replace('/public/verify')}
            />
            <Button
              label="Go to LexChain"
              leftIconName="home"
              onPress={() => router.replace('/')}
            />
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
