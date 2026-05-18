import { Text, View } from 'react-native';

import type { DocumentPermission } from '@/types';
import { Button } from '@/ui';

import { documentPdfToolsSheetStyles } from './document-pdf-tools-sheet.styles';

type DocumentPdfToolsContentProps = {
  documentId?: string;
  permissions: DocumentPermission;
};

export function DocumentPdfToolsContent({
  documentId,
  permissions,
}: DocumentPdfToolsContentProps) {
  return (
    <>
      <Text style={documentPdfToolsSheetStyles.metadataText}>
        Summary, verification, clauses, parties, access, and OCR can move into tabs here once the backend returns full PDF metadata.
      </Text>

      <View style={documentPdfToolsSheetStyles.chipRow}>
        {permissions.canViewSummary ? <Text style={documentPdfToolsSheetStyles.chip}>Summary</Text> : null}
        {permissions.canViewOcrText ? <Text style={documentPdfToolsSheetStyles.chip}>OCR text</Text> : null}
        {permissions.canVerifyDocument ? <Text style={documentPdfToolsSheetStyles.chip}>Verification</Text> : null}
        {permissions.canInviteUsers ? <Text style={documentPdfToolsSheetStyles.chip}>Access</Text> : null}
      </View>

      <Button
        label={permissions.canDownloadPdf ? 'Download PDF' : 'Download restricted'}
        variant="secondary"
        size="sm"
        leftIconName="download"
        disabled={!permissions.canDownloadPdf}
      />

      {documentId ? <Text style={documentPdfToolsSheetStyles.reference}>Reference {documentId}</Text> : null}
    </>
  );
}
