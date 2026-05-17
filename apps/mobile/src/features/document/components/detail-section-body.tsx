import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { DetailRiskBlock, DetailSection } from '../types/detail-sections.types';
import {
  DETAIL_SECTIONS_COLORS as COLORS,
  detailSectionsStyles as styles,
} from './detail-sections.styles';

const GROUP_ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  Organizations: 'account-balance',
  People: 'person',
  Dates: 'calendar-today',
  Links: 'link',
  'Document numbers': 'tag',
  Locations: 'location-on',
};

type DetailSectionBodyProps = {
  section: DetailSection;
  firstRiskBlock?: DetailRiskBlock;
  hasIcon: boolean;
  riskHelperText?: string;
};

export function DetailSectionBody({
  section,
  firstRiskBlock,
  hasIcon,
  riskHelperText,
}: DetailSectionBodyProps) {
  if ('body' in section) {
    return <Text style={styles.sectionBody}>{section.body}</Text>;
  }

  if (section.bodyBlocks) {
    return (
      <View style={styles.blocksWrap}>
        {section.bodyBlocks.map((block, index) =>
          block.kind === 'risk' ? (
            <View
              key={`${block.kind}-${index}`}
              style={[styles.riskBlock, hasIcon && styles.riskBlockWithIcon]}
            >
              {block.severity && block !== firstRiskBlock ? (
                <Text style={styles.riskPill}>{block.severity}</Text>
              ) : null}
              <Text style={styles.sectionBody}>{block.text}</Text>
              {riskHelperText ? (
                <View style={styles.riskHelperRow}>
                  <MaterialIcons name="info-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.riskHelperText}>{riskHelperText}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View key={`${block.kind}-${block.title}`} style={styles.groupBlock}>
              <View style={styles.groupTitleRow}>
                <MaterialIcons
                  name={GROUP_ICONS[block.title] ?? 'label'}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.groupTitle}>{block.title}</Text>
              </View>
              <View style={styles.chipWrap}>
                {block.values.map((value) => (
                  <Text key={value} style={styles.valueChip}>{value}</Text>
                ))}
              </View>
            </View>
          ),
        )}
      </View>
    );
  }

  return (
    <View style={styles.rowsWrap}>
      {section.rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={styles.rowValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}
