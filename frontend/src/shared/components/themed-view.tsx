import { View, type ViewProps } from 'react-native';
import { forwardRef, type ForwardRefRenderFunction } from 'react';

import { useThemeColor } from '@/hooks';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

const ThemedViewRender: ForwardRefRenderFunction<View, ThemedViewProps> = (
  { style, lightColor, darkColor, ...otherProps },
  ref
) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View ref={ref} style={[{ backgroundColor }, style]} {...otherProps} />;
};

export const ThemedView = forwardRef(ThemedViewRender);
