import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';
import { DocumentSummaryRow } from './document-summary-row';
import { documentSummaryCardStyles } from './document-summary-card.styles';

export type SummaryRow = {
  label: string;
  value: string;
};

type DocumentSummaryCardProps = {
  title: string;
  rows: SummaryRow[];
  summary: string;
};

export function DocumentSummaryCard({
  title,
  rows,
  summary,
}: DocumentSummaryCardProps) {
  return (
    <View style={documentSummaryCardStyles.card}>
      <View style={documentSummaryCardStyles.header}>
        <View style={documentSummaryCardStyles.iconBubble}>
          <MaterialIcons name="description" size={22} color={APP_COLORS.primary} />
        </View>
        <Text style={documentSummaryCardStyles.title}>{title}</Text>
      </View>

      {rows.map((row) => (
        <DocumentSummaryRow key={row.label} row={row} />
      ))}

      <View style={documentSummaryCardStyles.divider} />

      <View style={documentSummaryCardStyles.summaryWrap}>
        <Text style={documentSummaryCardStyles.summaryLabel}>Short summary</Text>
        <Text style={documentSummaryCardStyles.summaryBody}>{summary}</Text>
      </View>
    </View>
  );
}
