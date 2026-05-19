import BottomSheet from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

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
