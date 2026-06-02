import { StyleSheet, View } from 'react-native';

import type { DocumentPartyRole, ManageWhitelistData } from '@/types';

import { ManageWhitelistGrantActionSheet } from './manage-whitelist-grant-action-sheet';
import { ManageWhitelistMainSheet } from './manage-whitelist-main-sheet';
import { manageWhitelistStyles as styles } from './manage-whitelist.styles';
import { useManageWhitelistBottomSheet } from '../../hooks/use-manage-whitelist-bottom-sheet';

type ManageWhitelistBottomSheetProps = {
  visible: boolean;
  data: ManageWhitelistData | null;
  searchQuery: string;
  isLoading?: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressGrantAction?: (grantId: string, role: DocumentPartyRole) => void;
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
    onPressGrantAction,
    onPressRevoke,
  });

  if (!visible || !data) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      <ManageWhitelistMainSheet
        bottomSheetRef={sheet.bottomSheetRef}
        snapPoints={sheet.snapPoints}
        bottomInset={sheet.insets.bottom}
        data={data}
        searchQuery={searchQuery}
        isLoading={isLoading}
        onChangeSearchQuery={onChangeSearchQuery}
        onClose={onClose}
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
          revokeCountdown={sheet.revokeCountdown}
          revokeLabel={sheet.revokeLabel}
          onClose={sheet.closeGrantMenu}
          onPressRevoke={sheet.handlePressRevoke}
        />
      ) : null}
    </View>
  );
}
