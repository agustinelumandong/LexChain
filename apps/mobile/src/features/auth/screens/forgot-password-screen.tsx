import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

import { Button } from '@/ui';

import { AuthHeader } from '../auth-header';
import { AuthInput } from '../auth-input';
import { AuthScreenShell } from '../auth-screen-shell';
import { forgotPasswordScreenStyles as styles } from './forgot-password-screen.styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSentReset, setHasSentReset] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(3);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasSentReset) {
      setRedirectSeconds(3);
      return;
    }

    if (redirectSeconds === 0) {
      router.replace('/(auth)/sign-in');
      return;
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setRedirectSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [hasSentReset, redirectSeconds, router]);

  const goBackToSignIn = () => {
    router.back();
  };

  const handleSendReset = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      toast.warning('Enter your account email first');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      toast.warning('Enter a valid email address');
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    transitionTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setHasSentReset(true);
      toast.success('Reset link sent');
    }, 500);
  };

  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="PASSWORD RESET"
          title="Forgot password?"
          description="Enter account email and we will send reset instructions."
        />

        <View style={styles.fieldStack}>
          <AuthInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) {
                setEmailError('');
              }
              if (hasSentReset) {
                setHasSentReset(false);
              }
            }}
            iconName="mail-outline"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            error={emailError}
          />
        </View>

        {hasSentReset ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Reset email sent</Text>
            <Text style={styles.noticeBody}>
              Check your inbox and spam folder for next steps.
            </Text>
            <Text style={styles.noticeMeta}>
              Returning to sign in in {redirectSeconds}s.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Send reset link"
            fullWidth
            leftIconName="mail"
            loading={isSubmitting}
            onPress={handleSendReset}
          />

          <Button
            label="Back to sign in"
            variant="secondary"
            fullWidth
            leftIconName="arrow-back"
            onPress={goBackToSignIn}
          />
        </View>

        <Pressable onPress={goBackToSignIn}>
          <Text style={styles.supportText}>Remembered password? Sign in instead.</Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
