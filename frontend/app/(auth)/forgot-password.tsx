import { AuthHeader } from '@/features/auth/auth-header';
import { AuthInput } from '@/features/auth/auth-input';
import { AuthScreenShell } from '@/features/auth/auth-screen-shell';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  success: '#12A150',
  successSoft: '#E9FFF1',
  textMuted: '#6F8FB5',
};

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

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  fieldStack: {
    gap: 10,
  },
  notice: {
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.successSoft,
  },
  noticeTitle: {
    color: COLORS.success,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  noticeBody: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  noticeMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  actions: {
    gap: 12,
  },
  supportText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
