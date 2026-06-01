import { useCallback, useState } from 'react';

import { useCloseSheetOnBack } from '@/hooks';

export function useDocumentDetailsSheets() {
  const [isRenameSheetVisible, setIsRenameSheetVisible] = useState(false);
  const [isAskSheetVisible, setIsAskSheetVisible] = useState(false);
  const [isSearchSheetVisible, setIsSearchSheetVisible] = useState(false);
  const [isAuditSheetVisible, setIsAuditSheetVisible] = useState(false);
  const [isAnchorConfirmSheetVisible, setIsAnchorConfirmSheetVisible] = useState(false);
  const [isWhitelistSheetVisible, setIsWhitelistSheetVisible] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');

  const isAnySheetVisible =
    isRenameSheetVisible ||
    isAskSheetVisible ||
    isSearchSheetVisible ||
    isAuditSheetVisible ||
    isAnchorConfirmSheetVisible ||
    isWhitelistSheetVisible;

  const closeVisibleSheet = useCallback(() => {
    if (isAskSheetVisible) {
      setIsAskSheetVisible(false);
      return;
    }

    if (isSearchSheetVisible) {
      setIsSearchSheetVisible(false);
      return;
    }

    if (isAuditSheetVisible) {
      setIsAuditSheetVisible(false);
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
    isAuditSheetVisible,
    isRenameSheetVisible,
    isSearchSheetVisible,
    isWhitelistSheetVisible,
  ]);

  useCloseSheetOnBack(isAnySheetVisible, closeVisibleSheet);

  return {
    isRenameSheetVisible,
    isAskSheetVisible,
    isSearchSheetVisible,
    isAuditSheetVisible,
    isAnchorConfirmSheetVisible,
    isWhitelistSheetVisible,
    whitelistSearchQuery,
    setIsRenameSheetVisible,
    setIsAskSheetVisible,
    setIsSearchSheetVisible,
    setIsAuditSheetVisible,
    setIsAnchorConfirmSheetVisible,
    setIsWhitelistSheetVisible,
    setWhitelistSearchQuery,
  };
}
