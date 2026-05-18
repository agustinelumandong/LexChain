import type { VerifyDocumentData } from '@/types';

import { DocumentScreenHeader } from '../document-screen-header';
import { DocumentSummaryCard } from '../document-summary-card';
import { DocumentTopBar } from '../document-top-bar';
import { IntegrityCheckCard } from './integrity-check-card';
import { VerificationStatusCard } from './verification-status-card';

type VerifyDocumentSheetContentProps = {
  document: VerifyDocumentData;
  onPressBack: () => void;
};

export function VerifyDocumentSheetContent({
  document,
  onPressBack,
}: VerifyDocumentSheetContentProps) {
  return (
    <>
      <DocumentTopBar
        label="Verifying Docs"
        rightIconName="fact-check"
        onPressBack={onPressBack}
      />

      <DocumentScreenHeader
        eyebrow="VERIFYING DOCS STATUS"
        title="Verifying Docs"
        description="Summary and checks in progress."
      />

      <VerificationStatusCard
        title="Processing status"
        steps={document.steps}
      />

      <DocumentSummaryCard
        title={document.title}
        rows={document.summaryRows}
        summary={document.summary}
      />

      <IntegrityCheckCard
        offChainHash={document.offChainHash}
        onChainHash={document.onChainHash}
        status={document.integrityStatus}
        onPressViewAnchor={() => {}}
      />
    </>
  );
}
