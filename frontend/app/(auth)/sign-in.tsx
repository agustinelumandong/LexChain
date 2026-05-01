import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { AuthHeader, AuthInput, AuthScreenShell, signInSchema } from '@/features/auth';
import type { SignInFormValues } from '@/features/auth';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { APP_COLORS, fonts } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
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
    router.replace('/(auth)/sign-up');

    transitionTimeoutRef.current = setTimeout(() => {
      setIsSwitchingScreen(false);
    }, 420);
  };

  const handleSignIn = handleSubmit(
    () => {
      toast.success('Signed in successfully');
      router.push('/(tabs)');
    },
    () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.warning('Check your email and password');
    },
  );

  const navigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="WELCOME BACK"
          title="Sign in"
          description="Access your repository."
        />
        <View style={styles.fieldStack} >
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
            onPress={handleSignIn}
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


const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  fieldStack: {
    gap: 10,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.bg,
  },
  chipActive: {
    backgroundColor: '#E3F1FF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: APP_COLORS.primary,
  },
  chipText: {
    color: APP_COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
  forgotText: {
    color: APP_COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  actions: {
    gap: 12,
  },
});
