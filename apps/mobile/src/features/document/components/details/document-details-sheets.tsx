import type { DocumentPartyRole, ManageWhitelistData } from '@/types';
import { AskDocumentSheet } from '@/features/document/components/ask-document-sheet';
import { ManageWhitelistBottomSheet } from '@/features/document/components/manage-whitelist-bottom-sheet';
import { RenameDocumentSheet } from '@/features/document/components/rename-document-sheet';
import { SearchDocumentSheet } from '@/features/document/components/search-document-sheet';

type DocumentDetailsSheetsProps = {
  askAnswer?: string;
  askErrorMessage?: string;
  currentName: string;
  documentId: string;
  documentTitle: string;
  isAddPartyPending: boolean;
  isAskLoading: boolean;
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
  onCloseAsk: () => void;
  onCloseRename: () => void;
  onCloseSearch: () => void;
  onCloseWhitelist: () => void;
  onPressAddResult: (resultId: string, role: DocumentPartyRole) => void;
  onPressRevoke: (partyUserId: string) => void;
  onPressSearchMatch: (chunkId: string) => void;
  onRename: (newName: string) => void;
};

export function DocumentDetailsSheets({
  askAnswer,
  askErrorMessage,
  currentName,
  documentId,
  documentTitle,
  isAddPartyPending,
  isAskLoading,
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
  onCloseAsk,
  onCloseRename,
  onCloseSearch,
  onCloseWhitelist,
  onPressAddResult,
  onPressRevoke,
  onPressSearchMatch,
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
