import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui/button';
import { DocumentScreenHeader } from '@/features/document/components/document-screen-header';
import { DocumentSummaryCard } from '@/features/document/components/document-summary-card';
import { DocumentTopBar } from '@/features/document/components/document-top-bar';
import { IntegrityCheckCard } from '@/features/document/components/integrity-check-card';
import { VerificationStatusCard } from '@/features/document/components/verification-status-card';

const COLORS = {
  bg: '#F3F8FF',
};

export default function VerifyDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentTopBar
            label="Verifying Docs"
            rightIconName="fact-check"
            onPressBack={() => router.back()}
          />

          <DocumentScreenHeader
            eyebrow="VERIFYING DOCS STATUS"
            title="Verifying Docs"
            description="Summary and checks in progress."
          />

          <VerificationStatusCard
            title="Processing status"
            steps={[
              { label: 'Uploaded Docs Verifying', status: 'done' },
              { label: 'Docs Scanning', status: 'verifying' },
              { label: 'Generating Summary', status: 'pending' },
              { label: 'Anchor Pending', status: 'pending' },
            ]}
          />

          <DocumentSummaryCard
            title={`Deed of Sale #${id ?? '1002'}`}
            rows={[
              { label: 'Reference', value: 'REF-2026-1002' },
              { label: 'Parties', value: 'Santos • Dela Cruz' },
              { label: 'Date', value: '2026-06-10' },
              { label: 'Topical agenda', value: 'Ownership transfer' },
            ]}
            summary="Verification compares extracted record and uploaded file hash against anchored reference."
          />

          <IntegrityCheckCard
            offChainHash="0xA13...9F2"
            onChainHash="0xA13...9F2"
            status="Match"
            onPressViewAnchor={() => {}}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Back to details"
            variant="secondary"
            fullWidth
            leftIconName="arrow-back"
            onPress={() => router.push(`/document/${id ?? '1002'}`)}
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
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
