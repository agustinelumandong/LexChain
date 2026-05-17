import { StyleSheet, Text } from 'react-native';

import {
  DetailSectionsCard,
  DocumentSummaryCard,
} from '@/features/document';
import { ErrorState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import type {
  DetailBodyBlock,
  DocumentDetailsDocument,
  VersionHistoryItem,
} from '../../types/document-details.types';
import {
  formatContentType,
  formatDate,
  formatReference,
  formatWhitelistCountLabel,
} from '../../utils/document-details-formatters';
import {
  AccessControlCard,
  ConfidenceCard,
  DocumentStatusCard,
  VersionHistoryCard,
} from './document-detail-cards';
import { DocumentDetailsActions } from './document-details-actions';
import { DocumentDetailsSkeleton } from './document-details-skeleton';

type DetailSection = {
  title: string;
  bodyBlocks: DetailBodyBlock[];
};

type DocumentDetailsContentProps = {
  allowedCount: number;
  canManageWhitelist: boolean;
  canNotarizeDocument: boolean;
  document?: DocumentDetailsDocument;
  errorMessage?: string;
  extractedSections: DetailSection[];
  isLoading: boolean;
  isNotarizing: boolean;
  isViewer: boolean;
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
  canManageWhitelist,
  canNotarizeDocument,
  document,
  errorMessage,
  extractedSections,
  isLoading,
  isNotarizing,
  isViewer,
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
        status={document.status}
        uploadedAt={document.updated_at}
      />

      <AccessControlCard
        allowedCountLabel={formatWhitelistCountLabel(allowedCount)}
        canManageWhitelist={canManageWhitelist}
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
