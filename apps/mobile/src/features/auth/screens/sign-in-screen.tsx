import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

import {
  getInvitationRouteParams,
  normalizeAuthCallbackParams,
} from '@/features/auth/callback/auth-callback.params';
import { useSignIn } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';
import { Button } from '@/ui';

import { AuthHeader } from '../auth-header';
import { AuthInput } from '../auth-input';
import { AuthScreenShell } from '../auth-screen-shell';
import { signInSchema, type SignInFormValues } from '../schemas';
import { signInScreenStyles as styles } from './sign-in-screen.styles';

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authRouteParams = getInvitationRouteParams(normalizeAuthCallbackParams(params));
  const inviteEmail = authRouteParams.email ?? '';

  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const signInMutation = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: inviteEmail,
      password: '',
    },
  });

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const navigateToSignUp = () => {
    if (isSwitchingScreen) {
      return;
    }

    setIsSwitchingScreen(true);
    router.replace({
      pathname: '/(auth)/sign-up',
      params: authRouteParams,
    });

    transitionTimeoutRef.current = setTimeout(() => {
      setIsSwitchingScreen(false);
    }, 420);
  };

  const handleSignIn = handleSubmit(
    async (values) => {
      try {
        await signInMutation.mutateAsync({
          email: values.email.trim(),
          password: values.password,
        });

        toast.success('Signed in successfully');
        if (authRouteParams.document_id) {
          router.replace({
            pathname: '/document/[id]',
            params: { id: authRouteParams.document_id },
          });
          return;
        }

        router.replace('/(tabs)');
      } catch (error) {
        const appError = parseApiError(error);

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.error(appError.message);
      }
    },
    () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Check your email and password');
    },
  );

  const navigateToForgotPassword = () => {
    router.replace('/(auth)/forgot-password');
  };

  const handlePressSignIn = () => {
    Keyboard.dismiss();
    void handleSignIn();
  };

  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="WELCOME BACK"
          title="Sign in"
          description="Access your repository."
        />
        <View style={styles.fieldStack}>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <AuthInput
                label="Email"
                placeholder="your@email.com"
                value={value}
                onChangeText={onChange}
                iconName="mail-outline"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <AuthInput
                label="Password"
                placeholder="●●●●●●●●"
                value={value}
                onChangeText={onChange}
                iconName="lock-outline"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <View style={styles.utilityRow}>
          <Pressable
            style={[styles.chip, rememberMe && styles.chipActive]}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe ? (
                <MaterialIcons name="check" size={14} color={APP_COLORS.white} />
              ) : null}
            </View>
            <Text style={styles.chipText}>REMEMBER ME</Text>
          </Pressable>

          <Pressable onPress={navigateToForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button
            label="Sign in"
            fullWidth
            leftIconName="login"
            loading={signInMutation.isPending}
            disabled={signInMutation.isPending}
            onPress={handlePressSignIn}
          />

          <Button
            label="Create an account"
            variant="secondary"
            fullWidth
            leftIconName="person-add"
            disabled={isSwitchingScreen}
            onPress={navigateToSignUp}
          />
        </View>
      </View>
    </AuthScreenShell>
  );
}
