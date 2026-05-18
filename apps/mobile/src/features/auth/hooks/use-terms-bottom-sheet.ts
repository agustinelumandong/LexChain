import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UseTermsBottomSheetParams = {
  visible: boolean;
  hasReachedEnd: boolean;
  onReachedEnd: () => void;
};

export function useTermsBottomSheet({
  visible,
  hasReachedEnd,
  onReachedEnd,
}: UseTermsBottomSheetParams) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (hasReachedEnd) {
      return;
    }

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const threshold = 24;
    const reachedBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;

    if (reachedBottom) {
      onReachedEnd();
    }
  };

  return {
    bottomSheetRef,
    insets,
    snapPoints,
    handleScroll,
  };
}
