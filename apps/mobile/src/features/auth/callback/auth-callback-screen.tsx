import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/query/keys';
import { authTokenStorage, refreshTokenStorage } from '@/shared/utils/secure-storage';
import { APP_COLORS, fonts } from '@/theme';

import {
  getInvitationRouteParams,
  normalizeAuthCallbackParams,
  type AuthCallbackParams,
} from './auth-callback.params';

function getSessionTokens(params: AuthCallbackParams) {
  return {
    accessToken: params.access_token ?? params.accessToken,
    refreshToken: params.refresh_token ?? params.refreshToken,
  };
}

export function AuthCallbackScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const queryClient = useQueryClient();
  const hasHandledCallback = useRef(false);
  const [message, setMessage] = useState('Checking invitation link...');

  useEffect(() => {
    async function handleCallback() {
      if (hasHandledCallback.current) {
        return;
      }

      hasHandledCallback.current = true;

      const callbackUrl = await Linking.getInitialURL();
      const normalizedParams = normalizeAuthCallbackParams(params, callbackUrl);
      const { accessToken, refreshToken } = getSessionTokens(normalizedParams);

      if (accessToken && refreshToken) {
        setMessage('Signing you in...');
        await authTokenStorage.set(accessToken);
        await refreshTokenStorage.set(refreshToken);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        router.replace('/(tabs)');
        return;
      }

      const invitationParams = getInvitationRouteParams(normalizedParams);

      setMessage('Opening LexChain...');
      router.replace({
        pathname: '/(auth)/sign-in',
        params: invitationParams,
      });
    }

    void handleCallback();
  }, [params, queryClient]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ActivityIndicator color={APP_COLORS.primary} />
        <Text style={styles.title}>LexChain invitation</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: APP_COLORS.bg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  title: {
    color: APP_COLORS.navy,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  message: {
    color: APP_COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});

