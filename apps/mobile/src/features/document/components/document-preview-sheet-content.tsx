import type { DocumentPreviewData } from '@/types';

import { AccessWhitelistCard } from './access-whitelist-card';
import { DetailSectionsCard } from './detail-sections-card';
import { DocumentScreenHeader } from './document-screen-header';
import { DocumentSummaryCard } from './document-summary-card';
import { DocumentTopBar } from './document-top-bar';

type DocumentPreviewSheetContentProps = {
  document: DocumentPreviewData;
  onPressBack: () => void;
  onManageWhitelist?: () => void;
  onAddWhitelist?: () => void;
};

export function DocumentPreviewSheetContent({
  document,
  onPressBack,
  onManageWhitelist,
  onAddWhitelist,
}: DocumentPreviewSheetContentProps) {
  return (
    <>
      <DocumentTopBar
        label="Details"
        rightIconName="description"
        onPressBack={onPressBack}
      />

      <DocumentScreenHeader
        eyebrow="DOCUMENT DETAILS"
        title="Document details"
        description="Core summary, files, clauses, and topical context."
      />

      <DocumentSummaryCard
        title={document.title}
        rows={document.summaryRows}
        summary={document.summary}
      />

      <AccessWhitelistCard
        allowedCountLabel={document.whitelist.allowedCountLabel}
        helperText={document.whitelist.helperText}
        onPressManage={onManageWhitelist}
        onPressAdd={onAddWhitelist}
      />

      <DetailSectionsCard
        sections={document.sections}
        confidenceLabel={document.confidenceLabel}
        confidenceValue={document.confidenceValue}
      />
    </>
  );
}
