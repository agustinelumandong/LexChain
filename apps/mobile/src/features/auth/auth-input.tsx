import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/shared/components/themed-text';
import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  white: APP_COLORS.white,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  focusSoft: '#F4FAFF',
  danger: APP_COLORS.danger,
  dangerSoft: '#FFECEF',
};

type AuthInputProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconSize?: number;
  iconColor?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
  error?: string;
};

export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
  iconSize = 18,
  iconColor = COLORS.textMuted,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  autoCorrect = false,
  textContentType,
  error,
}: AuthInputProps) {
  const wrapperRef = useRef<View>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasError = Boolean(error);
  const isSecureEnabled = secureTextEntry && !isPasswordVisible;

  const handleFocus = () => {
    if (hasError) {
      return;
    }

    wrapperRef.current?.setNativeProps({
      style: styles.inputWrapFocused,
    });
  };

  const handleBlur = () => {
    wrapperRef.current?.setNativeProps({
      style: hasError ? styles.inputWrapError : styles.inputWrapDefault,
    });
  };

  return (
    <View style={styles.group}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <View
        ref={wrapperRef}
        style={[
          styles.inputWrap,
          styles.inputWrapDefault,
          hasError && styles.inputWrapError,
        ]}
      >
        <MaterialIcons
          name={iconName}
          size={iconSize}
          color={hasError ? COLORS.danger : iconColor}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isSecureEnabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={hasError ? COLORS.danger : COLORS.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  inputWrapDefault: {
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.focusSoft,
  },
  inputWrapError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
  },
  input: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: fonts.regular,
    paddingHorizontal: 4,
  },
});
