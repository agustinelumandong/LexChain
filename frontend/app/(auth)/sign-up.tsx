import { AuthHeader } from "@/features/auth/auth-header";
import { AuthInput } from "@/features/auth/auth-input";
import { AuthScreenShell } from "@/features/auth/auth-screen-shell";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import TermsBottomSheet from "@/features/auth/terms-bottom-sheet";

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  white: '#FFFFFF',
};

export default function SignUpScreen() {
  const router = useRouter();
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSwitchingScreen, setIsSwitchingScreen] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasReachedTermsEnd, setHasReachedTermsEnd] = useState(false);
  const [isTermsSheetVisible, setIsTermsSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="GET STARTED"
          title="Create an account"
          description="Join LexChain to manage your legal documents with ease."
        />

        <View style={styles.fieldStack}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <AuthInput
                label="First Name"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                iconName="person-outline"
              />
            </View>
            <View style={styles.nameField}>
              <AuthInput
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                iconName="person-outline"
              />
            </View>
          </View>

          <AuthInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              iconName="mail-outline"
            />

            <AuthInput
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              iconName="lock-outline"
              secureTextEntry
          />

          <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              iconName="lock-outline"
              secureTextEntry
            />
        </View>

        <Pressable style={styles.termsPreview} onPress={() => setIsTermsSheetVisible(true)}>
          <View style={styles.termsPreviewText}>
            <Text style={styles.termsPreviewTitle}>Terms of Service</Text>
            <Text style={styles.termsPreviewBody}>
              Review and accept terms before creating your account.
            </Text>
          </View>
          <Text style={styles.termsPreviewAction}>
            {acceptedTerms ? 'Accepted' : 'Open'}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Button
            label="Sign up"
            fullWidth
            leftIconName="person-add"
            onPress={() => setIsTermsSheetVisible(true)}
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
          setIsSubmitting(true);

          setTimeout(() => {
            setIsSubmitting(false);
            setIsTermsSheetVisible(false);
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
