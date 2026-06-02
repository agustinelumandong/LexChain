import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import {
  VerificationStatusCard,
} from '@/features/document';
import { useDocument, useVerifyOnChainDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { Button, ErrorState, ScreenHeader } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import {
  VERIFY_DOCUMENT_HEADER_CONTENT_GAP,
  verifyDocumentScreenStyles as styles,
} from './verify-document-screen.styles';

const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

export default function VerifyDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const documentQuery = useDocument(documentId);
  const onChainQuery = useVerifyOnChainDocument(documentId);
  const document = documentQuery.data;
  const onChainRecord = onChainQuery.data;

  const chainStatus = onChainQuery.isLoading
    ? 'Verifying'
    : onChainRecord
      ? onChainRecord.is_verified
        ? 'Verified'
        : 'Tampered'
      : 'Not Anchored';
  const isTampered = onChainRecord && !onChainRecord.is_verified;
  const [headerHeight, setHeaderHeight] = useState(126);
  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
  }, []);

  const handlePressViewAnchor = useCallback(async () => {
    if (onChainRecord?.transacttion_link) {
      try {
        await WebBrowser.openBrowserAsync(onChainRecord.transacttion_link);
      } catch (error) {
        console.error('Failed to open transaction link:', error);
      }
    }
  }, [onChainRecord]);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="DOCUMENT VERIFY"
          title="Verification"
          subtitle="Check summary, integrity, and on-chain status."
          leftAccessibilityLabel="Back"
          onPressLeft={() => router.back()}
          onHeightChange={handleHeaderHeightChange}
          includeTopInset
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + VERIFY_DOCUMENT_HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {documentQuery.error ? (
            <ErrorState
              title="Document unavailable"
              message={parseApiError(documentQuery.error).message}
              onRetry={() => {
                void documentQuery.refetch();
              }}
            />
          ) : null}

          {/* Hide processing status automatically if document is already recorded on-chain */}
          {!onChainRecord && (
            <VerificationStatusCard
              title="Processing status"
              steps={[
                { label: 'Document loaded', status: document ? 'done' : 'verifying' },
                {
                  label: 'Processing',
                  status: document?.summary ? 'done' : document ? 'verifying' : 'pending',
                },
                {
                  label: 'On-chain record',
                  status: onChainRecord ? 'done' : onChainQuery.isLoading ? 'verifying' : 'pending',
                },
              ]}
            />
          )}

          {onChainRecord ? (
            <View style={{
              backgroundColor: '#F7FBFF',
              borderRadius: 24,
              padding: 18,
              gap: 14,
              borderWidth: isTampered ? 1.5 : 1,
              borderColor: isTampered ? 'rgba(217, 75, 102, 0.4)' : '#EAF4FF',
              shadowColor: isTampered ? APP_COLORS.danger : '#1689F5',
              shadowOffset: isTampered ? { width: 0, height: 8 } : { width: 0, height: 4 },
              shadowOpacity: isTampered ? 0.15 : 0.03,
              shadowRadius: isTampered ? 16 : 8,
              elevation: isTampered ? 4 : 1,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{
                  color: COLORS.navy,
                  fontFamily: fonts.regular,
                  fontSize: 15,
                  lineHeight: 18,
                  fontWeight: '800',
                }}>On-chain details</Text>

                <View style={{
                  backgroundColor: onChainRecord.is_verified ? '#EAF8F0' : '#FEE2E2',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}>
                  <Text style={{
                    color: onChainRecord.is_verified ? '#12A150' : '#D94B66',
                    fontFamily: fonts.regular,
                    fontSize: 12,
                    fontWeight: '800',
                  }}>
                    {chainStatus}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#EAF4FF', marginVertical: 4 }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Text style={{ color: COLORS.textMuted, fontFamily: fonts.regular, fontSize: 12, fontWeight: '700' }}>On-chain ID</Text>
                <Text style={{ color: COLORS.navy, fontFamily: fonts.regular, fontSize: 12, fontWeight: '800' }} selectable>
                  {onChainRecord.onchain_document_id}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Text style={{ color: COLORS.textMuted, fontFamily: fonts.regular, fontSize: 12, fontWeight: '700' }}>Data hash</Text>
                <Text style={{ color: COLORS.navy, fontFamily: fonts.regular, fontSize: 12, fontWeight: '800' }} selectable>
                  {onChainRecord.data_hash ? `${onChainRecord.data_hash.slice(0, 10)}...${onChainRecord.data_hash.slice(-8)}` : 'Unknown'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Text style={{ color: COLORS.textMuted, fontFamily: fonts.regular, fontSize: 12, fontWeight: '700' }}>Issued by</Text>
                <Text style={{ color: COLORS.navy, fontFamily: fonts.regular, fontSize: 12, fontWeight: '800' }} selectable>
                  {onChainRecord.issued_by ? `${onChainRecord.issued_by.slice(0, 8)}...${onChainRecord.issued_by.slice(-6)}` : 'Unknown'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
                <Text style={{ color: COLORS.textMuted, fontFamily: fonts.regular, fontSize: 12, fontWeight: '700' }}>Transaction hash</Text>
                <Text style={{ color: COLORS.navy, fontFamily: fonts.regular, fontSize: 12, fontWeight: '800' }} selectable>
                  {onChainRecord.tx_hash ? `${onChainRecord.tx_hash.slice(0, 10)}...${onChainRecord.tx_hash.slice(-8)}` : 'Pending'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
                <Text style={{ color: COLORS.textMuted, fontFamily: fonts.regular, fontSize: 12, fontWeight: '700' }}>Anchored at</Text>
                <Text style={{ color: COLORS.navy, fontFamily: fonts.regular, fontSize: 12, fontWeight: '800' }}>
                  {onChainRecord.onchain_timestamp
                    ? new Date(onChainRecord.onchain_timestamp * 1000).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Unknown'}
                </Text>
              </View>
            </View>
          ) : null}

          {!onChainRecord && !onChainQuery.isLoading ? (
            <View style={{
              backgroundColor: '#FFFDF9',
              borderRadius: 24,
              padding: 20,
              gap: 12,
              borderWidth: 1,
              borderColor: '#FFF4DD',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: '#FFF4DD',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignSelf: 'center',
              }}>
                <Text style={{
                  color: '#B77900',
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                  {chainStatus}
                </Text>
              </View>
              <Text style={{
                color: COLORS.navy,
                fontFamily: fonts.regular,
                fontSize: 14,
                textAlign: 'center',
                fontWeight: '600',
                lineHeight: 18,
              }}>
                This document is not yet registered or anchored to the blockchain network.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={onChainRecord ? "View Transaction Details on BaseScan" : "Back to documents"}
            variant="primary"
            fullWidth
            leftIconName={onChainRecord ? undefined : "arrow-back"}
            onPress={onChainRecord ? handlePressViewAnchor : () => router.push('/(tabs)/documents')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
