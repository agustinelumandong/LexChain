import { AuthHeader, AuthInput, AuthScreenShell } from '@/features/auth';
import { Button } from '@/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { toast } from 'sonner-native';

import { fonts } from '@/theme';
const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  white: '#FFFFFF',

};

export default function SignInScreen() {
  const router = useRouter();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

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

  const validateSignIn = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.trim().length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSignIn = () => {
    if (!validateSignIn()) {
      toast.warning('Check your email and password');
      return;
    }

    toast.success('Signed in successfully');
    router.push('/(tabs)');
  };

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
          <AuthInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) {
                setEmailError('');
              }
            }}
            iconName="mail-outline"
            keyboardType="email-address"
            error={emailError}
          />

          <AuthInput
            label="Password"
            placeholder="●●●●●●●●"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (passwordError) {
                setPasswordError('');
              }
            }}
            iconName="lock-outline"
            secureTextEntry
            error={passwordError}
          />
        </View>

        <View style={styles.utilityRow}>
          <Pressable
            style={[styles.chip, rememberMe && styles.chipActive]}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe ? (
                <MaterialIcons name="check" size={14} color={COLORS.white} />
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
    backgroundColor: COLORS.surfaceSoft,
  },
  chipActive: {
    backgroundColor: '#E3F1FF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  actions: {
    gap: 12,
  },
});
