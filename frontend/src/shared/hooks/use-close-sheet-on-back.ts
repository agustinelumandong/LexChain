import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export function useCloseSheetOnBack(isOpen: boolean, onClose: () => void) {
  usePreventRemove(isOpen, () => {
    onClose();
  });

  useFocusEffect(
    useCallback(() => {
      if (!isOpen) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [isOpen, onClose]),
  );
}
