import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { promptToEnableAppLock } from '@/features/auth/app-lock-prompt';
import { STORAGE_KEYS } from '@/constants';
import { useSignIn, useVerifyMfaSignIn } from '@/services/query';
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
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const signInMutation = useSignIn();
  const verifyMfaMutation = useVerifyMfaSignIn();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: inviteEmail,
      password: '',
    },
  });

  useEffect(() => {
    async function loadRememberedEmail() {
      const [shouldRemember, rememberedEmail] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.rememberSignInEmail),
        AsyncStorage.getItem(STORAGE_KEYS.rememberedSignInEmail),
      ]);

      if (shouldRemember !== 'true' || !rememberedEmail) {
        return;
      }

      setRememberMe(true);

      if (!inviteEmail) {
        setValue('email', rememberedEmail);
      }
    }

    void loadRememberedEmail();

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [inviteEmail, setValue]);

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

  const completeSignIn = async (email: string) => {
    if (rememberMe) {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.rememberSignInEmail, 'true'],
        [STORAGE_KEYS.rememberedSignInEmail, email],
      ]);
    } else {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.rememberSignInEmail,
        STORAGE_KEYS.rememberedSignInEmail,
      ]);
    }

    toast.success('Signed in successfully');
    await promptToEnableAppLock();

    if (authRouteParams.document_id) {
      router.replace({
        pathname: '/document/[id]',
        params: { id: authRouteParams.document_id },
      });
      return;
    }

    router.replace('/(tabs)');
  };

  const handleSignIn = handleSubmit(
    async (values) => {
      const email = values.email.trim();

      try {
        const response = await signInMutation.mutateAsync({
          email,
          password: values.password,
        });

        if (response.mfa_required) {
          if (!response.mfa_token) {
            toast.error('MFA verification token missing');
            return;
          }

          setMfaToken(response.mfa_token);
          setMfaEmail(email);
          setMfaCode('');
          toast.info('Enter your authenticator code');
          return;
        }

        if (!response.access_token || !response.refresh_token || !response.user) {
          toast.error('Sign in did not return a session');
          return;
        }

        await completeSignIn(email);
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

  const handlePressVerifyMfa = async () => {
    Keyboard.dismiss();

    if (!mfaToken) {
      toast.error('Sign in again to verify MFA');
      return;
    }

    const code = mfaCode.trim();

    if (!/^\d{6}$/.test(code)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Enter a 6-digit authenticator code');
      return;
    }

    try {
      const response = await verifyMfaMutation.mutateAsync({
        mfa_token: mfaToken,
        code,
      });

      if (
        response.mfa_required ||
        !response.access_token ||
        !response.refresh_token ||
        !response.user
      ) {
        toast.error('MFA verification did not return a session');
        return;
      }

      setMfaToken(null);
      setMfaCode('');
      await completeSignIn(mfaEmail);
    } catch (error) {
      const appError = parseApiError(error);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(appError.message);
    }
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

          {mfaToken ? (
            <AuthInput
              label="Authenticator code"
              placeholder="123456"
              value={mfaCode}
              onChangeText={(value) => setMfaCode(value.replace(/\D/g, '').slice(0, 6))}
              iconName="verified-user"
              keyboardType="number-pad"
            />
          ) : null}
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
            label={mfaToken ? 'Verify code' : 'Sign in'}
            fullWidth
            leftIconName={mfaToken ? 'verified-user' : 'login'}
            loading={signInMutation.isPending || verifyMfaMutation.isPending}
            disabled={signInMutation.isPending || verifyMfaMutation.isPending}
            onPress={mfaToken ? handlePressVerifyMfa : handlePressSignIn}
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
