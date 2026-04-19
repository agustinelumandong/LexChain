import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/ui/button';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surfaceSoft: '#F7FBFF',
  borderSoft: '#D7EBFF',
};

type AccessWhitelistCardProps = {
  allowedCountLabel: string;
  helperText: string;
  onPressManage?: () => void;
  onPressAdd?: () => void;
};

export function AccessWhitelistCard({
  allowedCountLabel,
  helperText,
  onPressManage,
  onPressAdd,
}: AccessWhitelistCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copyBlock}>
        <Text style={styles.title}>Access whitelist</Text>
        <Text style={styles.count}>{allowedCountLabel}</Text>
        <Text style={styles.helper}>{helperText}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionSlot}>
          <Button
            label="Manage whitelist"
            variant="primary"
            size="md"
            fullWidth
            onPress={onPressManage}
          />
        </View>

        <View style={styles.actionSlot}>
          <Button
            label="Add"
            variant="secondary"
            size="md"
            fullWidth
            onPress={onPressAdd}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  copyBlock: {
    gap: 6,
  },
  title: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  count: {
    color: COLORS.primary,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  helper: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionSlot: {
    flex: 1,
  },
});
