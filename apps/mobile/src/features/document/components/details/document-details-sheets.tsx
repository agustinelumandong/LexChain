import type { DocumentPartyRole, ManageWhitelistData } from '@/types';
import { AskDocumentSheet } from '@/features/document/components/ask/ask-document-sheet';
import { ManageWhitelistBottomSheet } from '@/features/document/components/whitelist/manage-whitelist-bottom-sheet';
import { AuditTrailSheet } from '@/features/document/components/sheets/audit-trail-sheet';
import { ConfirmAnchorSheet } from '@/features/document/components/sheets/confirm-anchor-sheet';
import { RenameDocumentSheet } from '@/features/document/components/sheets/rename-document-sheet';
import { SearchDocumentSheet } from '@/features/document/components/sheets/search-document-sheet';
import type { AuditLogResponse } from '@/services/api';

type DocumentDetailsSheetsProps = {
  askAnswer?: string;
  askErrorMessage?: string;
  auditErrorMessage?: string;
  auditLogs: AuditLogResponse[];
  currentName: string;
  documentId: string;
  documentTitle: string;
  isAddPartyPending: boolean;
  isAnchorConfirmLoading: boolean;
  isAnchorConfirmSheetVisible: boolean;
  isAskLoading: boolean;
  isAuditLoading: boolean;
  isAuditSheetVisible: boolean;
  isAskSheetVisible: boolean;
  isPartiesLoading: boolean;
  isRemovePartyPending: boolean;
  isRenameLoading: boolean;
  isRenameSheetVisible: boolean;
  isSearchSheetVisible: boolean;
  isUserSearchFetching: boolean;
  isWhitelistSheetVisible: boolean;
  searchQuery: string;
  whitelistData: ManageWhitelistData;
  onAsk: (question: string) => void;
  onChangeSearchQuery: (value: string) => void;
  onCloseAnchorConfirm: () => void;
  onCloseAudit: () => void;
  onCloseAsk: () => void;
  onCloseRename: () => void;
  onCloseSearch: () => void;
  onCloseWhitelist: () => void;
  onPressAddResult: (resultId: string, role: DocumentPartyRole) => void;
  onPressConfirmAnchor: () => void;
  onPressRevoke: (partyUserId: string) => void;
  onPressSearchMatch: (chunkId: string) => void;
  onRetryAudit: () => void;
  onRename: (newName: string) => void;
};

export function DocumentDetailsSheets({
  askAnswer,
  askErrorMessage,
  auditErrorMessage,
  auditLogs,
  currentName,
  documentId,
  documentTitle,
  isAddPartyPending,
  isAnchorConfirmLoading,
  isAnchorConfirmSheetVisible,
  isAskLoading,
  isAuditLoading,
  isAuditSheetVisible,
  isAskSheetVisible,
  isPartiesLoading,
  isRemovePartyPending,
  isRenameLoading,
  isRenameSheetVisible,
  isSearchSheetVisible,
  isUserSearchFetching,
  isWhitelistSheetVisible,
  searchQuery,
  whitelistData,
  onAsk,
  onChangeSearchQuery,
  onCloseAnchorConfirm,
  onCloseAudit,
  onCloseAsk,
  onCloseRename,
  onCloseSearch,
  onCloseWhitelist,
  onPressAddResult,
  onPressConfirmAnchor,
  onPressRevoke,
  onPressSearchMatch,
  onRetryAudit,
  onRename,
}: DocumentDetailsSheetsProps) {
  return (
    <>
      <RenameDocumentSheet
        visible={isRenameSheetVisible}
        currentName={currentName}
        onClose={onCloseRename}
        onRename={onRename}
        isLoading={isRenameLoading}
      />

      <AskDocumentSheet
        visible={isAskSheetVisible}
        documentTitle={documentTitle}
        answer={askAnswer}
        isLoading={isAskLoading}
        errorMessage={askErrorMessage}
        onClose={onCloseAsk}
        onAsk={onAsk}
      />

      <SearchDocumentSheet
        visible={isSearchSheetVisible}
        documentId={documentId}
        documentTitle={documentTitle}
        onClose={onCloseSearch}
        onPressMatch={onPressSearchMatch}
      />

      <AuditTrailSheet
        visible={isAuditSheetVisible}
        logs={auditLogs}
        isLoading={isAuditLoading}
        errorMessage={auditErrorMessage}
        onClose={onCloseAudit}
        onRetry={onRetryAudit}
      />

      <ConfirmAnchorSheet
        visible={isAnchorConfirmSheetVisible}
        documentTitle={documentTitle}
        isLoading={isAnchorConfirmLoading}
        onCancel={onCloseAnchorConfirm}
        onConfirm={onPressConfirmAnchor}
      />

      <ManageWhitelistBottomSheet
        visible={isWhitelistSheetVisible}
        data={whitelistData}
        searchQuery={searchQuery}
        isLoading={
          isPartiesLoading ||
          isAddPartyPending ||
          isRemovePartyPending ||
          isUserSearchFetching
        }
        onChangeSearchQuery={onChangeSearchQuery}
        onClose={onCloseWhitelist}
        onPressGrantAction={() => {}}
        onPressRevoke={onPressRevoke}
        onPressAddResult={onPressAddResult}
      />
    </>
  );
}
