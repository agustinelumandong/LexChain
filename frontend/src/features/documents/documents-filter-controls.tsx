import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  borderSoft: APP_COLORS.borderSoft,
};

type DocumentsFilterControlsProps = {
  activeSummary: string[];
  sortLabel: string;
  onPressFilter: () => void;
  onPressSort: () => void;
};

type ControlButtonProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
};

function ControlButton({ iconName, label, detail, onPress }: ControlButtonProps) {
  return (
    <Pressable style={styles.controlButton} onPress={onPress}>
      <View style={styles.controlButtonLeft}>
        <MaterialIcons name={iconName} size={18} color={COLORS.primary} />
        <Text style={styles.controlButtonLabel}>{label}</Text>
      </View>

      <View style={styles.controlButtonRight}>
        {detail ? (
          <Text
            style={styles.controlButtonDetail}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {detail}
          </Text>
        ) : null}
        <MaterialIcons name="chevron-right" size={18} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

export function DocumentsFilterControls({
  activeSummary,
  sortLabel,
  onPressFilter,
  onPressSort,
}: DocumentsFilterControlsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.controlsRow}>
        <ControlButton
          iconName="filter-list"
          label="Filter"
          detail={activeSummary.length > 0 ? `${activeSummary.length} active` : 'All'}
          onPress={onPressFilter}
        />

        <ControlButton
          iconName="swap-vert"
          label="Sort"
          detail={sortLabel}
          onPress={onPressSort}
        />
      </View>

      {activeSummary.length > 0 ? (
        <View style={styles.summaryRow}>
          {activeSummary.map((summary) => (
            <View key={summary} style={styles.summaryChip}>
              <Text style={styles.summaryChipText}>{summary}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButtonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  controlButtonRight: {
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  controlButtonLabel: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  controlButtonDetail: {
    color: COLORS.textMuted,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryChipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
