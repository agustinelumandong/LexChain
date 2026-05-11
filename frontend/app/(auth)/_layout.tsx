import { Animated, Easing } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, StackNavigationState } from '@react-navigation/native';
import {
  createStackNavigator,
  StackCardInterpolationProps,
  StackNavigationEventMap,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

const { Navigator } = createStackNavigator();

const AuthStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);

const transitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: 360,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: 300,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
    },
  },
};

const slideFade = (
  direction: 'left' | 'right',
  { current, next, layouts }: StackCardInterpolationProps
) => {
  const progress = next
    ? Animated.add(current.progress, next.progress)
    : current.progress;

  const multiplier = direction === 'right' ? 1 : -1;

  return {
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 0.18, 1],
        outputRange: [0, 0.16, 1],
        extrapolate: 'clamp',
      }),
      transform: [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [layouts.screen.width * 0.22 * multiplier, 0, layouts.screen.width * -0.06 * multiplier],
            extrapolate: 'clamp',
          }),
        },
      ],
    },
  };
};

const forSlideFadeFromRight = (props: StackCardInterpolationProps) =>
  slideFade('right', props);

const forSlideFadeFromLeft = (props: StackCardInterpolationProps) =>
  slideFade('left', props);

export default function AuthLayout() {
  return (
    <AuthStack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardOverlayEnabled: false,
        transitionSpec,
      }}
    >
      <StatusBar style="auto" />
      <AuthStack.Screen
        name="sign-in"
        options={{
          cardStyleInterpolator: forSlideFadeFromLeft,
        }}
      />
      <AuthStack.Screen
        name="forgot-password"
        options={{
          cardStyleInterpolator: forSlideFadeFromRight,
        }}
      />
      <AuthStack.Screen
        name="sign-up"
        options={{
          cardStyleInterpolator: forSlideFadeFromRight,
        }}
      />
    </AuthStack>
  );
}
