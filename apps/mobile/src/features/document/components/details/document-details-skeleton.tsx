import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/ui';
import { APP_COLORS } from '@/theme';

export function DocumentDetailsSkeleton() {
  return (
    <>
      <View style={styles.skeletonActionRow}>
        <SkeletonBox height={40} borderRadius={999} style={styles.skeletonAction} />
        <SkeletonBox height={40} borderRadius={999} style={styles.skeletonAction} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="52%" height={18} borderRadius={999} />
        <View style={styles.skeletonMetaGrid}>
          <SkeletonBox width="44%" height={14} borderRadius={999} />
          <SkeletonBox width="35%" height={14} borderRadius={999} />
          <SkeletonBox width="48%" height={14} borderRadius={999} />
        </View>
        <SkeletonBox height={14} borderRadius={999} />
        <SkeletonBox width="86%" height={14} borderRadius={999} />
        <SkeletonBox width="64%" height={14} borderRadius={999} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="46%" height={18} borderRadius={999} />
        <SkeletonBox width="72%" height={14} borderRadius={999} />
        <SkeletonBox width={118} height={32} borderRadius={999} />
      </View>

      <View style={styles.skeletonCard}>
        <SkeletonBox width="50%" height={18} borderRadius={999} />
        <SkeletonBox width="76%" height={14} borderRadius={999} />
        <SkeletonBox width="58%" height={14} borderRadius={999} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skeletonAction: {
    flex: 1,
    minWidth: 132,
  },
  skeletonCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  skeletonMetaGrid: {
    gap: 10,
  },
});
