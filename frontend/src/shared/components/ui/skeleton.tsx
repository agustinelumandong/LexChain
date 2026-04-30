import { StyleSheet, View, type ViewStyle } from 'react-native';

import { APP_COLORS } from '@/theme';

type SkeletonBoxProps = {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBoxProps) {
  return (
    <View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: APP_COLORS.surfaceSoft,
    overflow: 'hidden',
  },
});
