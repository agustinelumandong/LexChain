import type { PropsWithChildren } from 'react';
import type { Edge } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView, type ThemedViewProps } from '@/shared/components/themed-view';

type ScreenProps = PropsWithChildren<
  ThemedViewProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
    edges?: Edge[];
    padded?: boolean;
    scroll?: boolean;
  }
>;

export function Screen({
  children,
  contentContainerStyle,
  edges = ['top', 'right', 'left'],
  padded = false,
  scroll = false,
  style,
  ...themedProps
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          contentInsetAdjustmentBehavior="automatic">
          <ThemedView style={[padded && styles.padded, style]} {...themedProps}>
            {children}
          </ThemedView>
        </ScrollView>
      ) : (
        <ThemedView style={[styles.content, padded && styles.padded, style]} {...themedProps}>
          {children}
        </ThemedView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    padding: 16,
  },
});
