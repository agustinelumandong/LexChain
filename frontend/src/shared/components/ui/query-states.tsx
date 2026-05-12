import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

type LoadingStateProps = {
  message?: string;
};

type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={APP_COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.state}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  message = 'There is no data to show right now.',
}: EmptyStateProps) {
  return (
    <View style={styles.state}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    borderRadius: 16,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  retryText: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
});
