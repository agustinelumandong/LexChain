import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  borderSoft: '#D7EBFF',
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
        {detail ? <Text style={styles.controlButtonDetail}>{detail}</Text> : null}
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
    gap: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlButtonLabel: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  controlButtonDetail: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  summaryChipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
