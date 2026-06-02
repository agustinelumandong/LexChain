import type { DocumentPartyRole, ManageWhitelistData } from '@/types';
import { AskDocumentSheet } from '@/features/document/components/ask/ask-document-sheet';
import { ManageWhitelistBottomSheet } from '@/features/document/components/whitelist/manage-whitelist-bottom-sheet';
import { ConfirmAnchorSheet } from '@/features/document/components/sheets/confirm-anchor-sheet';
import { RenameDocumentSheet } from '@/features/document/components/sheets/rename-document-sheet';
import type { AskChatMessage } from '@/services/api';

type DocumentDetailsSheetsProps = {
  askAnswer?: string;
  askErrorMessage?: string;
  currentName: string;
  documentTitle: string;
  isAddPartyPending: boolean;
  isAnchorConfirmLoading: boolean;
  isAnchorConfirmSheetVisible: boolean;
  isAskLoading: boolean;
  isAskSheetVisible: boolean;
  isPartiesLoading: boolean;
  isRemovePartyPending: boolean;
  isRenameLoading: boolean;
  isRenameSheetVisible: boolean;
  isUserSearchFetching: boolean;
  isWhitelistSheetVisible: boolean;
  searchQuery: string;
  whitelistData: ManageWhitelistData;
  onAsk: (question: string, history: AskChatMessage[]) => void;
  onChangeSearchQuery: (value: string) => void;
  onCloseAnchorConfirm: () => void;
  onCloseAsk: () => void;
  onCloseRename: () => void;
  onCloseWhitelist: () => void;
  onPressAddResult: (resultId: string, role: DocumentPartyRole) => void;
  onPressConfirmAnchor: () => void;
  onPressGrantAction: (grantId: string, role: DocumentPartyRole) => void;
  onPressRevoke: (partyUserId: string) => void;
  onRename: (newName: string) => void;
};

export function DocumentDetailsSheets({
  askAnswer,
  askErrorMessage,
  currentName,
  documentTitle,
  isAddPartyPending,
  isAnchorConfirmLoading,
  isAnchorConfirmSheetVisible,
  isAskLoading,
  isAskSheetVisible,
  isPartiesLoading,
  isRemovePartyPending,
  isRenameLoading,
  isRenameSheetVisible,
  isUserSearchFetching,
  isWhitelistSheetVisible,
  searchQuery,
  whitelistData,
  onAsk,
  onChangeSearchQuery,
  onCloseAnchorConfirm,
  onCloseAsk,
  onCloseRename,
  onCloseWhitelist,
  onPressAddResult,
  onPressConfirmAnchor,
  onPressGrantAction,
  onPressRevoke,
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
        onPressGrantAction={onPressGrantAction}
        onPressRevoke={onPressRevoke}
        onPressAddResult={onPressAddResult}
      />
    </>
  );
}
