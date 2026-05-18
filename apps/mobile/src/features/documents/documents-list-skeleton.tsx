import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/ui';

export function DocumentsListSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.copy}>
            <SkeletonBox width="70%" height={16} borderRadius={999} />
            <SkeletonBox width="54%" height={13} borderRadius={999} />
            <SkeletonBox width="38%" height={13} borderRadius={999} />
          </View>
          <SkeletonBox width={72} height={32} borderRadius={999} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    minHeight: 92,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 8,
  },
});
