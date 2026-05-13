import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import { queryKeys } from '@/services/query';
import { APP_COLORS, fonts } from '@/theme';
import type { SupabaseUser } from '@/types';

const DEMO_ADMIN_USER: SupabaseUser = {
  id: 'super-admin-demo',
  email: 'superadmin@lexchain.demo',
  role: 'super_admin',
  user_metadata: {
    f_name: 'Super',
    l_name: 'Admin',
  },
};

export function AdminLoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(DEMO_ADMIN_USER.email ?? '');
  const [password, setPassword] = useState('presentation');

  const handleLogin = () => {
    queryClient.setQueryData(queryKeys.auth.currentUser, {
      ...DEMO_ADMIN_USER,
      email: email.trim() || DEMO_ADMIN_USER.email,
    });
    router.replace('/admin/dashboard');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.brand}>LexChain</Text>
          <Text style={styles.title}>Super Admin Login</Text>
          <Text style={styles.subtitle}>
            Presentation mode creates a local super admin session.
          </Text>
        </View>

        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        <Button
          label="Enter admin dashboard"
          leftIconName="admin-panel-settings"
          fullWidth
          onPress={handleLogin}
        />

        <Link href="/" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.returnLink}>Return to LexChain</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.bg,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 28,
    gap: 22,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  header: {
    gap: 8,
  },
  brand: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  fields: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.bg,
    paddingHorizontal: 14,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
  },
  returnLink: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
