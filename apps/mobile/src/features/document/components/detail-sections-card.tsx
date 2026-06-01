import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import type { DetailRiskBlock, DetailSection } from '../types/detail-sections.types';
import { DetailSectionBody } from './detail-section-body';
import {
  DETAIL_SECTIONS_COLORS as COLORS,
  detailSectionsStyles as styles,
} from './detail-sections.styles';

type DetailSectionsCardProps = {
  sections: DetailSection[];
  confidenceLabel?: string;
  confidenceValue?: string;
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  riskHelperText?: string;
};

export function DetailSectionsCard({
  sections,
  confidenceLabel,
  confidenceValue,
  iconName,
  riskHelperText,
}: DetailSectionsCardProps) {
  return (
    <View style={styles.card}>
      {sections.map((section) => {
        const firstRiskBlock = section.bodyBlocks?.find(
          (block): block is DetailRiskBlock =>
            block.kind === 'risk' && Boolean(block.severity),
        );

        return (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                {iconName ? (
                  <View style={styles.iconBubble}>
                    <MaterialIcons name={iconName} size={22} color={COLORS.primary} />
                  </View>
                ) : null}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {firstRiskBlock?.severity ? (
                <Text style={styles.riskPill}>{firstRiskBlock.severity}</Text>
              ) : null}
            </View>

            <DetailSectionBody
              section={section}
              firstRiskBlock={firstRiskBlock}
              hasIcon={Boolean(iconName)}
              riskHelperText={riskHelperText}
            />
          </View>
        );
      })}

      {confidenceLabel && confidenceValue ? (
        <View style={styles.confidenceCard}>
          <Text style={styles.confidenceLabel}>{confidenceLabel}</Text>
          <Text style={styles.confidenceValue}>{confidenceValue}</Text>
        </View>
      ) : null}
    </View>
  );
}
