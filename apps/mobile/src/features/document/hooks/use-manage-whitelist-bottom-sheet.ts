import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ManageWhitelistData, WhitelistGrant } from '@/types';

import type { MobileUserRoleKey } from '../constants/manage-whitelist.constants';

type UseManageWhitelistBottomSheetParams = {
  visible: boolean;
  data: ManageWhitelistData | null;
  searchQuery: string;
  onPressRevoke?: (grantId: string) => void;
};

export function useManageWhitelistBottomSheet({
  visible,
  data,
  searchQuery,
  onPressRevoke,
}: UseManageWhitelistBottomSheetParams) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const grantSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [selectedGrantRole, setSelectedGrantRole] =
    useState<MobileUserRoleKey>('participant');
  const [isGrantRoleDropdownOpen, setIsGrantRoleDropdownOpen] = useState(false);
  const [revokeCountdown, setRevokeCountdown] = useState<number | null>(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const grantSnapPoints = useMemo(() => ['55%'], []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const grants = data?.grants ?? [];
  const searchResults = data?.searchResults ?? [];
  const filteredSearchResults =
    normalizedQuery.length > 0
      ? searchResults.filter(
          (result) =>
            result.name.toLowerCase().includes(normalizedQuery) ||
            result.email.toLowerCase().includes(normalizedQuery),
        )
      : [];
  const shouldShowSearchResults = normalizedQuery.length > 0;
  const selectedGrant = grants.find((grant) => grant.id === selectedGrantId);

  useEffect(() => {
    if (!visible) {
      setSelectedGrantId(null);
      setIsGrantRoleDropdownOpen(false);
      setRevokeCountdown(null);
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedGrantId) {
        grantSheetRef.current?.close();
        return true;
      }

      bottomSheetRef.current?.close();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [selectedGrantId, visible]);

  useEffect(() => {
    if (revokeCountdown === null || revokeCountdown <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRevokeCountdown((current) =>
        current === null ? null : Math.max(0, current - 1),
      );
    }, 1000);

    return () => clearTimeout(timeout);
  }, [revokeCountdown]);

  const openGrantMenu = (grant: WhitelistGrant) => {
    setSelectedGrantId(grant.id);
    setSelectedGrantRole(grant.assignedAs ?? 'participant');
    setIsGrantRoleDropdownOpen(false);
    setRevokeCountdown(null);
  };

  const closeGrantMenu = useCallback(() => {
    setSelectedGrantId(null);
    setIsGrantRoleDropdownOpen(false);
    setRevokeCountdown(null);
  }, []);

  const handlePressRevoke = useCallback(() => {
    if (!selectedGrant) {
      return;
    }

    if (revokeCountdown === null) {
      setRevokeCountdown(3);
      return;
    }

    if (revokeCountdown === 0) {
      onPressRevoke?.(selectedGrant.id);
      closeGrantMenu();
    }
  }, [closeGrantMenu, onPressRevoke, revokeCountdown, selectedGrant]);

  const revokeLabel =
    revokeCountdown === null
      ? 'Revoke'
      : revokeCountdown > 0
        ? `${revokeCountdown}...`
        : 'Confirm';

  const toggleGrantRoleDropdown = () => {
    setIsGrantRoleDropdownOpen((current) => !current);
  };

  const selectGrantRole = (role: MobileUserRoleKey) => {
    setSelectedGrantRole(role);
    setIsGrantRoleDropdownOpen(false);
  };

  return {
    bottomSheetRef,
    grantSheetRef,
    insets,
    snapPoints,
    grantSnapPoints,
    filteredSearchResults,
    shouldShowSearchResults,
    selectedGrant,
    selectedGrantRole,
    isGrantRoleDropdownOpen,
    revokeCountdown,
    revokeLabel,
    openGrantMenu,
    closeGrantMenu,
    handlePressRevoke,
    toggleGrantRoleDropdown,
    selectGrantRole,
  };
}
