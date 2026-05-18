import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { profileDetailColors, profileDetailStyles } from './profile-detail.styles';

type ProfileTextFieldProps = TextInputProps & {
  label: string;
};

export function ProfileTextField({ label, style, ...props }: ProfileTextFieldProps) {
  return (
    <View style={profileDetailStyles.fieldWrap}>
      <Text style={profileDetailStyles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={profileDetailColors.textMuted}
        style={[profileDetailStyles.fieldInput, style]}
      />
    </View>
  );
}
