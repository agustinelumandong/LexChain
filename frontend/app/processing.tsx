import React from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiSummaryDraftCard } from '@/features/upload/ai-summary-draft-card';
import { Button } from '@/shared/components/ui/button';
import { DocumentScreenHeader } from '@/features/document/components/document-screen-header';
import { DocumentTopBar } from '@/features/document/components/document-top-bar';
import { VerificationStatusCard } from '@/features/document/components/verification-status-card';

const COLORS = {
  bg: '#F3F8FF',
};

export default function ProcessingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentTopBar
            label="Processing"
            rightIconName="description"
            onPressBack={() => router.back()}
          />

          <DocumentScreenHeader
            eyebrow="PROCESSING STATUS"
            title="Processing"
            description="Summary and checks in progress."
          />

          <VerificationStatusCard
            title="Processing status"
            steps={[
              { label: 'Uploaded', status: 'done' },
              { label: 'Scanning', status: 'verifying' },
              { label: 'Generating Summary', status: 'pending' },
              { label: 'Anchor Pending', status: 'pending' },
            ]}
          />

          <AiSummaryDraftCard
            source="Deed of Sale #1002"
            confidence="High"
            summary="Summary: Ownership transfer language, signatories, and key dates were identified from the uploaded document."
            onPressReviewSummary={() => router.push('/verify/1002')}
            onPressOpenDoc={() => router.push('/document/1002')}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Go back to document"
            fullWidth
            leftIconName="arrow-back"
            onPress={() => router.push('/(tabs)/documents')}
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
