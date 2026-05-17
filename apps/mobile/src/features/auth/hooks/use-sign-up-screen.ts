import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner-native';

import { useCloseSheetOnBack } from '@/hooks';
import { useSignUp } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import {
  getInvitationRouteParams,
  normalizeAuthCallbackParams,
} from '../callback/auth-callback.params';
import { signUpSchema, type SignUpFormValues } from '../schemas/sign-up.schema';
import { getPasswordStrengthState } from '../utils/password-strength';

export function useSignUpScreen() {
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
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: inviteEmail,
      password: '',
      confirmPassword: '',
    },
  });
  const password = form.watch('password');
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

  const handleOpenTerms = form.handleSubmit(
    () => {
      setIsTermsSheetVisible(true);
    },
    () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Complete all required sign up fields');
    },
  );

  const submitSignUp = form.handleSubmit(async (values) => {
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

  const closeTermsSheet = () => {
    setIsTermsSheetVisible(false);
  };

  const toggleAcceptedTerms = () => {
    setAcceptedTerms((prev) => !prev);
  };

  const markTermsReachedEnd = () => {
    setHasReachedTermsEnd(true);
  };

  return {
    form,
    acceptedTerms,
    hasReachedTermsEnd,
    isSwitchingScreen,
    isTermsSheetVisible,
    passwordStrength,
    shouldShowPasswordStrength,
    signUpMutation,
    closeTermsSheet,
    handleOpenTerms,
    markTermsReachedEnd,
    navigateToSignIn,
    submitSignUp,
    toggleAcceptedTerms,
  };
}
