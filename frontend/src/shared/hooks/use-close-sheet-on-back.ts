import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export function useCloseSheetOnBack(isOpen: boolean, onClose: () => void) {
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
