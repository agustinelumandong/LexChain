import { Controller } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@/ui';

import { AuthHeader } from '../auth-header';
import { AuthInput } from '../auth-input';
import { AuthScreenShell } from '../auth-screen-shell';
import TermsBottomSheet from '../terms-bottom-sheet';
import { useSignUpScreen } from '../hooks/use-sign-up-screen';
import { signUpStyles as styles } from './sign-up-screen.styles';

export default function SignUpScreen() {
  const signUp = useSignUpScreen();
  const {
    control,
    formState: { errors },
  } = signUp.form;

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
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange } }) => (
                  <AuthInput
                    label="First Name"
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    iconName="person-outline"
                    autoCapitalize="words"
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange } }) => (
                  <AuthInput
                    label="Last Name"
                    placeholder="Doe"
                    value={value}
                    onChangeText={onChange}
                    iconName="person-outline"
                    autoCapitalize="words"
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

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
                placeholder="Create a strong password"
                value={value}
                onChangeText={onChange}
                iconName="lock-outline"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <View style={styles.passwordStrengthCard}>
            {signUp.shouldShowPasswordStrength ? (
              <>
                <View style={styles.passwordStrengthTrack}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${signUp.passwordStrength.progress * 100}%`,
                        backgroundColor: signUp.passwordStrength.tone,
                      },
                    ]}
                  />
                </View>

                <View style={styles.passwordStrengthMeta}>
                  <Text style={styles.passwordStrengthHint}>
                    {signUp.passwordStrength.missingRules.length > 0
                      ? `Need: ${signUp.passwordStrength.missingRules.join(', ')}`
                      : 'All password rules met'}
                  </Text>

                  <Text
                    style={[
                      styles.passwordStrengthLabel,
                      { color: signUp.passwordStrength.tone },
                    ]}
                  >
                    {signUp.passwordStrength.label}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <AuthInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={value}
                onChangeText={onChange}
                iconName="lock-outline"
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Sign up"
            fullWidth
            leftIconName="person-add"
            loading={signUp.signUpMutation.isPending}
            disabled={signUp.signUpMutation.isPending}
            onPress={signUp.handleOpenTerms}
          />

          <Button
            label="Already have an account."
            variant="secondary"
            fullWidth
            leftIconName="login"
            disabled={signUp.isSwitchingScreen}
            onPress={signUp.navigateToSignIn}
          />
        </View>
      </View>

      <TermsBottomSheet
        visible={signUp.isTermsSheetVisible}
        acceptedTerms={signUp.acceptedTerms}
        hasReachedEnd={signUp.hasReachedTermsEnd}
        isSubmitting={signUp.signUpMutation.isPending}
        onClose={signUp.closeTermsSheet}
        onToggleAcceptedTerms={signUp.toggleAcceptedTerms}
        onReachedEnd={signUp.markTermsReachedEnd}
        onConfirm={() => {
          void signUp.submitSignUp();
        }}
      />
    </AuthScreenShell>
  );
}
