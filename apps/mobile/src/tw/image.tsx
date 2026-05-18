import React from 'react';
import { Image as RNImage } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useCssElement } from 'react-native-css';

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

type FlattenedImageStyle = {
  objectFit?: React.ComponentProps<typeof RNImage>['contentFit'];
  objectPosition?: React.ComponentProps<typeof RNImage>['contentPosition'];
  [key: string]: unknown;
};

function CSSImage(props: React.ComponentProps<typeof AnimatedExpoImage>) {
  const flattenedStyle = (StyleSheet.flatten(props.style) ?? {}) as FlattenedImageStyle;
  const { objectFit, objectPosition, ...style } = flattenedStyle;

  return (
    <AnimatedExpoImage
      {...props}
      contentFit={objectFit}
      contentPosition={objectPosition}
      source={
        typeof props.source === 'string' ? { uri: props.source } : props.source
      }
      style={style as React.ComponentProps<typeof AnimatedExpoImage>['style']}
    />
  );
}

export type ImageProps = React.ComponentProps<typeof CSSImage> & {
  className?: string;
};

export const Image = (props: ImageProps) => {
  return useCssElement(CSSImage, props, { className: 'style' });
};

Image.displayName = 'CSS(Image)';
