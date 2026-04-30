import { AuthHeader, AuthInput, AuthScreenShell, TermsBottomSheet } from "@/features/auth";
import { Button } from "@/ui";
import { useCloseSheetOnBack } from "@/hooks";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { toast } from 'sonner-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  white: '#FFFFFF',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
  success: '#12A150',
  warning: '#F59E0B',
  danger: '#D94B66',
};

const PASSWORD_RULES = [
  { key: 'length', label: '8+ characters', test: (value: string) => value.length >= 8 },
  { key: 'number', label: '1 number', test: (value: string) => /\d/.test(value) },
  { key: 'upper', label: '1 uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'lower', label: '1 lowercase', test: (value: string) => /[a-z]/.test(value) },
  { key: 'special', label: '1 special', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

function getPasswordStrengthState(value: string) {
  const checks = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(value),
  }));

  const passedCount = checks.filter((rule) => rule.passed).length;
  const progress = passedCount / PASSWORD_RULES.length;

  let tone = COLORS.danger;
  let label = 'Weak';

  if (passedCount >= 5) {
    tone = COLORS.success;
    label = 'Strong';
  } else if (passedCount >= 3) {
    tone = COLORS.warning;
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
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasReachedTermsEnd, setHasReachedTermsEnd] = useState(false);
  const [isTermsSheetVisible, setIsTermsSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    router.replace('/(auth)/sign-in');

    transitionTimeoutRef.current = setTimeout(() => {
      setIsSwitchingScreen(false);
    }, 420);
  };

  const validateSignUp = () => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
      isValid = false;
    } else {
      setLastNameError('');
    }

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
    } else if (passwordStrength.passedCount < PASSWORD_RULES.length) {
      setPasswordError('Password must meet all strength requirements.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleOpenTerms = () => {
    if (!validateSignUp()) {
      toast.warning('Complete all required sign up fields');
      return;
    }

    setIsTermsSheetVisible(true);
  };

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
              <AuthInput
                label="First Name"
                placeholder="John"
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  if (firstNameError) {
                    setFirstNameError('');
                  }
                }}
                iconName="person-outline"
                autoCapitalize="words"
                error={firstNameError}
              />
            </View>
            <View style={styles.nameField}>
              <AuthInput
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChangeText={(value) => {
                  setLastName(value);
                  if (lastNameError) {
                    setLastNameError('');
                  }
                }}
                iconName="person-outline"
                autoCapitalize="words"
                error={lastNameError}
              />
            </View>
          </View>

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
              placeholder="Create a strong password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) {
                  setPasswordError('');
                }
                if (confirmPasswordError && confirmPassword === value) {
                  setConfirmPasswordError('');
                }
              }}
              iconName="lock-outline"
              secureTextEntry
              error={passwordError}
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

          <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (confirmPasswordError) {
                  setConfirmPasswordError('');
                }
              }}
              iconName="lock-outline"
              secureTextEntry
              error={confirmPasswordError}
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
        isSubmitting={isSubmitting}
        onClose={() => setIsTermsSheetVisible(false)}
        onToggleAcceptedTerms={() => setAcceptedTerms((prev) => !prev)}
        onReachedEnd={() => setHasReachedTermsEnd(true)}
        onConfirm={() => {
          if (!validateSignUp()) {
            toast.warning('Review your sign up details before continuing');
            setIsTermsSheetVisible(false);
            return;
          }

          if (!acceptedTerms) {
            toast.warning('Accept the terms to create your account');
            return;
          }

          setIsSubmitting(true);

          setTimeout(() => {
            setIsSubmitting(false);
            setIsTermsSheetVisible(false);
            toast.success('Account created successfully');
            router.replace('/(tabs)');
          }, 500);
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
    backgroundColor: COLORS.surfaceSoft,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  passwordStrengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
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
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  termsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
  },
  termsPreviewText: {
    flex: 1,
    gap: 4,
  },
  termsPreviewTitle: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  termsPreviewBody: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  termsPreviewAction: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
