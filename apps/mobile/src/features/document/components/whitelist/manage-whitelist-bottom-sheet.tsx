import type { DocumentPartyRole, ManageWhitelistData } from '@/types';

import { ManageWhitelistGrantActionSheet } from './manage-whitelist-grant-action-sheet';
import { ManageWhitelistMainSheet } from './manage-whitelist-main-sheet';
import { useManageWhitelistBottomSheet } from '../../hooks/use-manage-whitelist-bottom-sheet';

type ManageWhitelistBottomSheetProps = {
  visible: boolean;
  data: ManageWhitelistData | null;
  searchQuery: string;
  isLoading?: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressGrantAction?: (grantId: string) => void;
  onPressRevoke?: (grantId: string) => void;
  onPressAddResult?: (resultId: string, role: DocumentPartyRole) => void;
};

export function ManageWhitelistBottomSheet({
  visible,
  data,
  searchQuery,
  isLoading = false,
  onChangeSearchQuery,
  onClose,
  onPressGrantAction,
  onPressRevoke,
  onPressAddResult,
}: ManageWhitelistBottomSheetProps) {
  const sheet = useManageWhitelistBottomSheet({
    visible,
    data,
    searchQuery,
    onPressRevoke,
  });

  if (!visible || !data) {
    return null;
  }

  return (
    <>
      <ManageWhitelistMainSheet
        bottomSheetRef={sheet.bottomSheetRef}
        snapPoints={sheet.snapPoints}
        bottomInset={sheet.insets.bottom}
        data={data}
        searchQuery={searchQuery}
        filteredSearchResults={sheet.filteredSearchResults}
        shouldShowSearchResults={sheet.shouldShowSearchResults}
        isLoading={isLoading}
        onChangeSearchQuery={onChangeSearchQuery}
        onClose={onClose}
        onPressGrantAction={onPressGrantAction}
        onPressAddResult={onPressAddResult}
        onOpenGrantMenu={sheet.openGrantMenu}
      />

      {sheet.selectedGrant ? (
        <ManageWhitelistGrantActionSheet
          grantSheetRef={sheet.grantSheetRef}
          snapPoints={sheet.grantSnapPoints}
          bottomInset={sheet.insets.bottom}
          selectedGrant={sheet.selectedGrant}
          selectedGrantRole={sheet.selectedGrantRole}
          isGrantRoleDropdownOpen={sheet.isGrantRoleDropdownOpen}
          revokeCountdown={sheet.revokeCountdown}
          revokeLabel={sheet.revokeLabel}
          onClose={sheet.closeGrantMenu}
          onPressRevoke={sheet.handlePressRevoke}
          onToggleRoleDropdown={sheet.toggleGrantRoleDropdown}
          onSelectGrantRole={sheet.selectGrantRole}
        />
      ) : null}
    </>
  );
}
