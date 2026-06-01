import { useCallback, useState } from 'react';

import { useCloseSheetOnBack } from '@/hooks';

export function useDocumentDetailsSheets() {
  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [isAskSheetVisible, setIsAskSheetVisible] = useState(false);
  const [isAnchorConfirmSheetVisible, setIsAnchorConfirmSheetVisible] = useState(false);
  const [isWhitelistSheetVisible, setIsWhitelistSheetVisible] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');

  const isAnySheetVisible =
    isRenameSheetVisible ||
    isAskSheetVisible ||
    isAnchorConfirmSheetVisible ||
    isWhitelistSheetVisible;

  const closeVisibleSheet = useCallback(() => {
    if (isAskSheetVisible) {
      setIsAskSheetVisible(false);
      return;
    }

    if (isAnchorConfirmSheetVisible) {
      setIsAnchorConfirmSheetVisible(false);
      return;
    }

    if (isWhitelistSheetVisible) {
      setIsWhitelistSheetVisible(false);
      setWhitelistSearchQuery('');
      return;
    }

    if (isRenameSheetVisible) {
      setIsRenameSheetVisible(false);
    }
  }, [
    isAskSheetVisible,
    isAnchorConfirmSheetVisible,
    isRenameSheetVisible,
    isWhitelistSheetVisible,
  ]);

  useCloseSheetOnBack(isAnySheetVisible, closeVisibleSheet);

  return {
    isRenameSheetVisible,
    isAskSheetVisible,
    isAnchorConfirmSheetVisible,
    isWhitelistSheetVisible,
    whitelistSearchQuery,
    setIsRenameSheetVisible,
    setIsAskSheetVisible,
    setIsAnchorConfirmSheetVisible,
    setIsWhitelistSheetVisible,
    setWhitelistSearchQuery,
  };
}
