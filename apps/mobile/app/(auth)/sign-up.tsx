import { AuthHeader, AuthInput, AuthScreenShell, TermsBottomSheet, PASSWORD_RULES, signUpSchema } from "@/features/auth";
import { Button } from "@/ui";
import { useCloseSheetOnBack } from "@/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { toast } from 'sonner-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { SignUpFormValues } from '@/features/auth';
import { APP_COLORS, fonts } from '@/theme';
import { useSignUp } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import {
  getInvitationRouteParams,
  normalizeAuthCallbackParams,
} from '@/features/auth/callback/auth-callback.params';

function getPasswordStrengthState(value: string) {
  const checks = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(value),
  }));

  const passedCount = checks.filter((rule) => rule.passed).length;
  const progress = passedCount / PASSWORD_RULES.length;

  let tone: string = APP_COLORS.danger;
  let label = 'Weak';

  if (passedCount >= 5) {
    tone = APP_COLORS.success;
    label = 'Strong';
  } else if (passedCount >= 3) {
    tone = APP_COLORS.warning;
    label = 'Fair';
  }

  return {
    checks,
    passedCount,
    progress,
    tone,
    label,
    missingRules: checks.filter((rule) => !rule.passed).map((rule) => rule.label),
  };
}

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authRouteParams = getInvitationRouteParams(normalizeAuthCallbackParams(params));
  const inviteEmail = authRouteParams.email ?? '';

  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasReachedTermsEnd, setHasReachedTermsEnd] = useState(false);
  const [isTermsSheetVisible, setIsTermsSheetVisible] = useState(false);
  const signUpMutation = useSignUp();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: inviteEmail,
      password: '',
      confirmPassword: '',
    },
  });
  const password = watch('password');
  const passwordStrength = getPasswordStrengthState(password);
  const shouldShowPasswordStrength = password.length > 0;

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useCloseSheetOnBack(isTermsSheetVisible, () => {
    setIsTermsSheetVisible(false);
  });

  const navigateToSignIn = () => {
    if (isSwitchingScreen) {
      return;
    }

    setIsSwitchingScreen(true);
    router.replace({
      pathname: '/(auth)/sign-in',
      params: authRouteParams,
    });

    transitionTimeoutRef.current = setTimeout(() => {
      setIsSwitchingScreen(false);
    }, 420);
  };

  const handleOpenTerms = handleSubmit(
    () => {
      setIsTermsSheetVisible(true);
    },
    () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Complete all required sign up fields');
    },
  );

  const submitSignUp = handleSubmit(async (values) => {
    if (!acceptedTerms) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Accept the terms to create your account');
      return;
    }

    try {
      const response = await signUpMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
        f_name: values.firstName.trim(),
        l_name: values.lastName.trim(),
        phone_number: null,
        ...(authRouteParams.token ? { token: authRouteParams.token } : null),
      });

      setIsTermsSheetVisible(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(
        response.requires_email_confirmation
          ? 'Account created. Check your email to verify before signing in.'
          : response.message,
      );
      router.replace({
        pathname: '/(auth)/sign-in',
        params: authRouteParams,
      });
    } catch (error) {
      const appError = parseApiError(error);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(appError.message);
    }
  });


  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="CREATE ACCOUNT"
          title="Create account"
          description="Start your secure workspace."
        />

        <View style={styles.fieldStack}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange } }) => (
                  <AuthInput
                    label="First Name"
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    iconName="person-outline"
                    autoCapitalize="words"
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={styles.nameField}>
             <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange } }) => (
                  <AuthInput
                    label="Last Name"
                    placeholder="Doe"
                    value={value}
                    onChangeText={onChange}
                    iconName="person-outline"
                    autoCapitalize="words"
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

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
                  placeholder="Create a strong password"
                  value={value}
                  onChangeText={onChange}
                  iconName="lock-outline"
                  secureTextEntry
                  error={errors.password?.message}
              />
            )}
          />

          <View style={styles.passwordStrengthCard}>
            {shouldShowPasswordStrength ? (
              <>
                <View style={styles.passwordStrengthTrack}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${passwordStrength.progress * 100}%`,
                        backgroundColor: passwordStrength.tone,
                      },
                    ]}
                  />
                </View>

                <View style={styles.passwordStrengthMeta}>
                  <Text style={styles.passwordStrengthHint}>
                    {passwordStrength.missingRules.length > 0
                      ? `Need: ${passwordStrength.missingRules.join(', ')}`
                      : 'All password rules met'}
                  </Text>

                  <Text
                    style={[
                      styles.passwordStrengthLabel,
                      { color: passwordStrength.tone },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <AuthInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={value}
                onChangeText={onChange}
                iconName="lock-outline"
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
          />

        </View>

        {/*<Pressable style={styles.termsPreview} onPress={handleOpenTerms}>
          <View style={styles.termsPreviewText}>
            <Text style={styles.termsPreviewTitle}>Terms of Service</Text>
            <Text style={styles.termsPreviewBody}>
              Review and accept terms before creating your account.
            </Text>
          </View>
          <Text style={styles.termsPreviewAction}>
            {acceptedTerms ? 'Accepted' : 'Open'}
          </Text>
        </Pressable>*/}

        <View style={styles.actions}>
          <Button
            label="Sign up"
            fullWidth
            leftIconName="person-add"
            disabled={signUpMutation.isPending}
            onPress={handleOpenTerms}
          />

          <Button
            label="Already have an account."
            variant="secondary"
            fullWidth
            leftIconName="login"
            disabled={isSwitchingScreen}
            onPress={navigateToSignIn}
          />
        </View>
      </View>

      <TermsBottomSheet
        visible={isTermsSheetVisible}
        acceptedTerms={acceptedTerms}
        hasReachedEnd={hasReachedTermsEnd}
        isSubmitting={signUpMutation.isPending}
        onClose={() => setIsTermsSheetVisible(false)}
        onToggleAcceptedTerms={() => setAcceptedTerms((prev) => !prev)}
        onReachedEnd={() => setHasReachedTermsEnd(true)}
        onConfirm={() => {
          void submitSignUp();
        }}
      />
    </AuthScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  fieldStack: {
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
  },
  chip: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
  },
  chipText: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
  actions: {
    gap: 12,
  },
  passwordStrengthCard: {
    gap: 8,
    paddingHorizontal: 4,
    marginTop: -2,
  },
  passwordStrengthLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  passwordStrengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  passwordStrengthMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  passwordStrengthHint: {
    flex: 1,
    color: APP_COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  termsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: APP_COLORS.bg,
  },
  termsPreviewText: {
    flex: 1,
    gap: 4,
  },
  termsPreviewTitle: {
    color: APP_COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  termsPreviewBody: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  termsPreviewAction: {
    color: APP_COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
