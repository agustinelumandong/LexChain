import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessWhitelistCard } from '@/features/document/components/access-whitelist-card';
import { Button } from '@/shared/components/ui/button';
import { DetailSectionsCard } from '@/features/document/components/detail-sections-card';
import { DocumentScreenHeader } from '@/features/document/components/document-screen-header';
import { DocumentSummaryCard } from '@/features/document/components/document-summary-card';
import { DocumentTopBar } from '@/features/document/components/document-top-bar';

const COLORS = {
  bg: '#F3F8FF',
};

export default function DocumentDetailsScreen() {
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
            label="Details"
            rightIconName="description"
            onPressBack={() => router.back()}
          />

          <DocumentScreenHeader
            eyebrow="DOCUMENT DETAILS"
            title="Document details"
            description="Core summary, files, clauses, and topical context."
          />

          <DocumentSummaryCard
            title={`Deed of Sale #${id ?? '1002'}`}
            rows={[
              { label: 'Reference', value: 'REF-2026-1002' },
              { label: 'Parties', value: 'Santos • Dela Cruz' },
              { label: 'Files uploaded', value: '3 files' },
            ]}
            summary="Land sale file with attachments, extracted clauses, and context for legal review."
          />

          <AccessWhitelistCard
            allowedCountLabel="3 allowed wallets/users"
            helperText="Whitelist rules apply to this document only. Manage allowed access before sharing."
            onPressManage={() => {}}
            onPressAdd={() => {}}
          />

          <DetailSectionsCard
            sections={[
              {
                title: 'Core fields',
                rows: [
                  { label: 'Document type', value: 'Deed of Sale' },
                  { label: 'Effective date', value: '2026-06-10' },
                ],
              },
              {
                title: 'Clauses',
                body: 'Payment, transfer, warranty.',
              },
              {
                title: 'Obligations',
                rows: [
                  { label: 'Seller', value: 'Transfer title' },
                  { label: 'Buyer', value: 'Release payment' },
                ],
              },
              {
                title: 'Attachments',
                rows: [{ label: 'Files', value: 'SaleDeed.pdf + 2' }],
              },
              {
                title: 'Risk flags',
                rows: [{ label: 'Missing fields', value: 'None' }],
              },
            ]}
            confidenceLabel="Confidence"
            confidenceValue="Verified"
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Verify this document"
            fullWidth
            rightIconName="verified-user"
            onPress={() => router.push(`/verify/${id ?? '1002'}`)}
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
