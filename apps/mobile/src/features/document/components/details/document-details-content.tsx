import { StyleSheet, Text } from 'react-native';

import { ErrorState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import { DetailSectionsCard } from '@/features/document/components/detail-sections-card';
import { DocumentSummaryCard } from '@/features/document/components/document-summary-card';
import type {
  DetailBodyBlock,
  DocumentDetailsDocument,
  VersionHistoryItem,
} from '@/features/document/types/document-details.types';
import {
  formatContentType,
  formatDate,
  formatReference,
  formatWhitelistCountLabel,
} from '@/features/document/utils/document-details-formatters';
import {
  AccessControlCard,
  ConfidenceCard,
  DocumentStatusCard,
  VersionHistoryCard,
} from '@/features/document/components/details/document-detail-cards';
import { DocumentDetailsActions } from '@/features/document/components/details/document-details-actions';
import { DocumentDetailsSkeleton } from '@/features/document/components/details/document-details-skeleton';

type DetailSection = {
  title: string;
  bodyBlocks: DetailBodyBlock[];
};

type DocumentDetailsContentProps = {
  allowedCount: number;
  anchoredAt?: number;
  canManageWhitelist: boolean;
  canNotarizeDocument: boolean;
  document?: DocumentDetailsDocument;
  errorMessage?: string;
  extractedSections: DetailSection[];
  isLoading: boolean;
  isAnchorTimeLoading: boolean;
  isNotarizing: boolean;
  isViewer: boolean;
  partyNames: string[];
  riskSections: DetailSection[];
  versionHistory: VersionHistoryItem[];
  onPressManageWhitelist: () => void;
  onPressNotarize: () => void;
  onPressPdf: () => void;
  onPressSearch: () => void;
  onRetry: () => void;
};

export function DocumentDetailsContent({
  allowedCount,
  anchoredAt,
  canManageWhitelist,
  canNotarizeDocument,
  document,
  errorMessage,
  extractedSections,
  isLoading,
  isAnchorTimeLoading,
  isNotarizing,
  isViewer,
  partyNames,
  riskSections,
  versionHistory,
  onPressManageWhitelist,
  onPressNotarize,
  onPressPdf,
  onPressSearch,
  onRetry,
}: DocumentDetailsContentProps) {
  if (isLoading) {
    return <DocumentDetailsSkeleton />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Document unavailable"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (!document) {
    return <ErrorState title="Document not found" message="No document data returned." />;
  }

  return (
    <>
      <DocumentDetailsActions
        canNotarizeDocument={canNotarizeDocument}
        isAnchored={Boolean(document.on_chain)}
        isNotarizing={isNotarizing}
        isViewer={isViewer}
        onPressNotarize={onPressNotarize}
        onPressPdf={onPressPdf}
        onPressSearch={onPressSearch}
      />

      <DocumentSummaryCard
        title="Document summary"
        rows={[
          { label: 'Reference', value: formatReference(document.document_id) },
          { label: 'Type', value: formatContentType(document.content_type) },
          { label: 'Uploaded', value: formatDate(document.created_at) },
        ]}
        summary={document.summary ?? 'Summary is not ready yet.'}
      />

      <DocumentStatusCard
        anchoredAt={anchoredAt}
        isAnchorTimeLoading={isAnchorTimeLoading}
        onChain={document.on_chain}
      />

      <AccessControlCard
        allowedCountLabel={formatWhitelistCountLabel(allowedCount)}
        canManageWhitelist={canManageWhitelist}
        partyNames={partyNames}
        onPressManage={onPressManageWhitelist}
      />

      <VersionHistoryCard items={versionHistory} />

      <Text style={styles.insightsEyebrow}>DOCUMENT INSIGHTS</Text>

      <DetailSectionsCard
        sections={riskSections}
        iconName="warning-amber"
        riskHelperText="Why this matters"
      />

      <DetailSectionsCard
        sections={extractedSections}
        iconName="description"
      />

      <ConfidenceCard isReady={Boolean(document.summary)} />
    </>
  );
}

const styles = StyleSheet.create({
  insightsEyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
