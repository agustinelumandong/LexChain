import { AuthHeader } from '@/features/auth/auth-header';
import { AuthInput } from '@/features/auth/auth-input';
import { AuthScreenShell } from '@/features/auth/auth-screen-shell';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  surfaceSoft: '#F3F8FF',
  white: '#FFFFFF',

};

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthScreenShell>
      <View style={styles.container}>
        <AuthHeader
          eyebrow="WELCOME BACK"
          title="Sign in "
          description="Access your repository."
        />
        <View style={styles.fieldStack} >
          <AuthInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            iconName="mail"
          />

          <AuthInput
            label="Password"
            placeholder="●●●●●●●●"
            value={password}
            onChangeText={setPassword}
            iconName="lock"
            secureTextEntry
          />
        </View>

        <View style={styles.utilityRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>REMEMBER ME</Text>
          </View>

          <Pressable onPress={() => { }}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button
            label="Sign in"
            fullWidth
            leftIconName="login"
            onPress={() => router.push('/')}
          />

          <Button
            label="Create an account"
            variant="secondary"
            fullWidth
            leftIconName="person-add"
            onPress={() => router.push('/')}
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
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  actions: {
    gap: 12,
  },
});
