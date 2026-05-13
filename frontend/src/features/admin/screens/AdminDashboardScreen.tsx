import { StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';

import { AdminStatCard } from '../components/AdminStatCard';
import { useAdminStats } from '../hooks';
import { AdminScreenShell } from './admin-screen-shell';

export function AdminDashboardScreen() {
  const statsQuery = useAdminStats();
  const stats = statsQuery.data;

  return (
    <AdminScreenShell
      title="Dashboard"
      subtitle="Presentation summary of LexChain activity and verification health."
    >
      {statsQuery.isLoading ? <LoadingState message="Loading admin stats..." /> : null}
      {statsQuery.error ? <ErrorState title="Unable to load stats" /> : null}
      {stats ? (
        <View style={styles.grid}>
          <AdminStatCard label="Total users" value={stats.total_users} />
          <AdminStatCard label="Total documents" value={stats.total_documents} />
          <AdminStatCard
            label="Verified documents"
            value={stats.total_verified_documents}
          />
          <AdminStatCard
            label="Pending documents"
            value={stats.total_pending_documents}
          />
          <AdminStatCard
            label="Failed verifications"
            value={stats.total_failed_verifications}
          />
        </View>
      ) : null}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
