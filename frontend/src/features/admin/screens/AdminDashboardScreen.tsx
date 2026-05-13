import { StyleSheet, Text, View } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import { AdminStatCard } from '../components/AdminStatCard';
import { useAdminAnalytics, useAdminStats } from '../hooks';
import { AdminScreenShell } from './admin-screen-shell';

export function AdminDashboardScreen() {
  const statsQuery = useAdminStats();
  const analyticsQuery = useAdminAnalytics();
  const stats = statsQuery.data;
  const analytics = analyticsQuery.data?.slice(0, 4);

  return (
    <AdminScreenShell
      title="Dashboard"
      subtitle="System-owner view for platform health, document processing, blockchain anchoring, and verification activity."
    >
      {statsQuery.isLoading ? <LoadingState message="Loading admin stats..." /> : null}
      {statsQuery.error ? <ErrorState title="Unable to load stats" /> : null}
      {stats ? (
        <>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Super Admin scope</Text>
            <Text style={styles.noticeText}>
              Monitor system activity, users, document metadata, processing status,
              blockchain records, and audit events. Private legal document content
              remains controlled by document-level access and whitelist permissions.
            </Text>
          </View>

          <View style={styles.grid}>
            <AdminStatCard label="Total users" value={stats.total_users} detail="Registered accounts" />
            <AdminStatCard
              label="Total document issuers"
              value={stats.total_document_issuers}
              detail="Offices and law firms"
            />
            <AdminStatCard
              label="Total uploaded documents"
              value={stats.total_documents}
              detail="Metadata monitored"
            />
            <AdminStatCard
              label="Processed documents"
              value={stats.processed_documents}
              detail="OCR/NLP completed"
            />
            <AdminStatCard
              label="Pending documents"
              value={stats.pending_documents}
              detail="Queued or processing"
            />
            <AdminStatCard
              label="Failed documents"
              value={stats.failed_documents}
              detail="Needs retry or review"
            />
            <AdminStatCard
              label="Total verifications"
              value={stats.total_verifications}
              detail="Verification attempts"
            />
            <AdminStatCard
              label="Tamper alerts"
              value={stats.tamper_alerts}
              detail="Hash mismatch results"
            />
          </View>
        </>
      ) : null}

      {analytics ? (
        <View style={styles.panel}>
          <View>
            <Text style={styles.panelTitle}>Operational Snapshot</Text>
            <Text style={styles.panelSubtitle}>
              Demo analytics for processed documents, category usage, verification
              results, and OCR/NLP health.
            </Text>
          </View>
          <View style={styles.metricGrid}>
            {analytics.map((metric) => (
              <View key={metric.id} style={styles.metricRow}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: metric.id === 'an_004' ? '18%' : '74%' }]} />
                </View>
                <Text style={styles.metricDetail}>{metric.detail}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {stats ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Processing Pipeline</Text>
          <View style={styles.pipeline}>
            {['Upload received', 'OCR extraction', 'NLP summary', 'Blockchain anchoring', 'Verification logging'].map((item) => (
              <View key={item} style={styles.pipelineItem}>
                <View style={styles.pipelineDot} />
                <Text style={styles.pipelineText}>{item}</Text>
              </View>
            ))}
          </View>
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
  notice: {
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: APP_COLORS.surfaceSoft,
    gap: 6,
    padding: 16,
  },
  noticeTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  noticeText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  panel: {
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: APP_COLORS.white,
    gap: 18,
    padding: 18,
  },
  panelTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  panelSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricRow: {
    flex: 1,
    minWidth: 240,
    gap: 8,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricLabel: {
    color: APP_COLORS.navy,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  metricValue: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  barTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
  },
  metricDetail: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  pipeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pipelineItem: {
    alignItems: 'center',
    borderColor: APP_COLORS.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pipelineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.success,
  },
  pipelineText: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
