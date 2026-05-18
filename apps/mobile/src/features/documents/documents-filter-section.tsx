import type { ReactNode } from 'react';
import { View } from 'react-native';

import { documentsFilterStyles as styles } from './documents-filter-sheet.styles';

type DocumentsFilterSectionProps = {
  active: boolean;
  children: ReactNode;
};

export function DocumentsFilterSection({
  active,
  children,
}: DocumentsFilterSectionProps) {
  return (
    <View style={[styles.section, active && styles.sectionActive]}>
      {children}
    </View>
  );
}
