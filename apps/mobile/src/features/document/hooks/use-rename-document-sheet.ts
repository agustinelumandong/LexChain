import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UseRenameDocumentSheetParams = {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
};

export function useRenameDocumentSheet({
  visible,
  currentName,
  onClose,
  onRename,
}: UseRenameDocumentSheetParams) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const latestNameRef = useRef(currentName);
  const insets = useSafeAreaInsets();
  const [newName, setNewName] = useState(currentName);
  const [canRename, setCanRename] = useState(Boolean(currentName.trim()));
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [headerHasShadow, setHeaderHasShadow] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const snapPoints = useMemo(() => ['70%'], []);

  const resetState = useCallback(() => {
    latestNameRef.current = currentName;
    setNewName(currentName);
    setCanRename(Boolean(currentName.trim()));
    setError(null);
    setHeaderHasShadow(false);
    setIsInputFocused(false);
  }, [currentName]);

  const handleDismiss = useCallback(() => {
    onClose();
    resetState();
  }, [onClose, resetState]);

  const handleRename = useCallback(() => {
    const trimmedName = latestNameRef.current.trim();

    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }

    if (trimmedName.length > 255) {
      setError('Name is too long (max 255 characters)');
      return;
    }

    setError(null);
    Keyboard.dismiss();
    onRename(trimmedName);
  }, [onRename]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const shouldShowShadow = event.nativeEvent.contentOffset.y > 2;
      if (shouldShowShadow !== headerHasShadow) {
        setHeaderHasShadow(shouldShowShadow);
      }
    },
    [headerHasShadow],
  );

  const handleChangeName = (text: string) => {
    latestNameRef.current = text;
    setNewName(text);
    setCanRename(Boolean(text.trim()));
    setError(null);
  };

  const handleFocusInput = () => {
    setIsInputFocused(true);
  };

  const handleBlurInput = () => {
    setIsInputFocused(false);
  };

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [resetState, visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.max(0, event.endCoordinates.height - insets.bottom));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  return {
    bottomSheetRef,
    insets,
    snapPoints,
    newName,
    canRename,
    error,
    keyboardHeight,
    headerHasShadow,
    isInputFocused,
    handleBlurInput,
    handleChangeName,
    handleDismiss,
    handleFocusInput,
    handleRename,
    handleScroll,
  };
}
