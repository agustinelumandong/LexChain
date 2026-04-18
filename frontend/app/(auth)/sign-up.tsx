import { AuthHeader } from "@/features/auth/auth-header";
import { AuthInput } from "@/features/auth/auth-input";
import { AuthScreenShell } from "@/features/auth/auth-screen-shell";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  white: '#FFFFFF',
};

export default function SignUpScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

        <Pressable onPress={() => { }} style={styles.chip}>
          <Text style={styles.chipText}>I agree to the Terms of Service</Text>
        </Pressable>

        <View style={styles.actions}>
          <Button
            label="Sign up"
            fullWidth
            leftIconName="person-add"
            onPress={() => router.push('/(tabs)')}
          />

          <Button
            label="Already have an account? Sign in"
            variant="secondary"
            fullWidth
            leftIconName="login"
            onPress={() => router.push('/(auth)/sign-in')}
          />
        </View>
      </View>
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
});
