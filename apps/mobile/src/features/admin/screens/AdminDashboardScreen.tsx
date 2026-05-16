import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { ErrorState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import { useAdminAnalytics, useAdminStats } from '../hooks';
import { AdminScreenShell } from './admin-screen-shell';

type DashboardStat = {
  label: string;
  value: number;
  detail: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const CHART_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ACTIVITY_DAYS = [
  { day: 'Mon', processed: 42, pending: 18 },
  { day: 'Tue', processed: 56, pending: 20 },
  { day: 'Wed', processed: 64, pending: 26 },
  { day: 'Thu', processed: 82, pending: 29 },
  { day: 'Fri', processed: 80, pending: 27 },
  { day: 'Sat', processed: 68, pending: 21 },
  { day: 'Sun', processed: 46, pending: 15 },
];

const PIPELINE_ITEMS = [
  'Upload received',
  'OCR extraction',
  'NLP summary',
  'Blockchain anchoring',
  'Verification logging',
];

export function AdminDashboardScreen() {
  const statsQuery = useAdminStats();
  const analyticsQuery = useAdminAnalytics();
  const stats = statsQuery.data;
  const analytics = analyticsQuery.data?.slice(0, 4);

  const statCards: DashboardStat[] = stats
    ? [
        { label: 'Total users', value: stats.total_users, detail: 'Registered accounts', icon: 'group' },
        { label: 'Total document issuers', value: stats.total_document_issuers, detail: 'Offices and law firms', icon: 'business' },
        { label: 'Total uploaded documents', value: stats.total_documents, detail: 'Metadata monitored', icon: 'description' },
        { label: 'Processed documents', value: stats.processed_documents, detail: 'OCR/NLP completed', icon: 'task-alt' },
        { label: 'Pending documents', value: stats.pending_documents, detail: 'Queued or processing', icon: 'pending-actions' },
        { label: 'Failed documents', value: stats.failed_documents, detail: 'Needs retry or review', icon: 'error-outline' },
        { label: 'Total verifications', value: stats.total_verifications, detail: 'Verification attempts', icon: 'verified-user' },
        { label: 'Tamper alerts', value: stats.tamper_alerts, detail: 'Hash mismatch results', icon: 'report-problem' },
      ]
    : [];

  return (
    <AdminScreenShell
      title="Dashboard"
      subtitle="System-owner view for platform health, document processing, blockchain anchoring, and verification activity."
    >
      {statsQuery.isLoading ? <LoadingState message="Loading admin stats..." /> : null}
      {statsQuery.error ? <ErrorState title="Unable to load stats" /> : null}

      {stats ? (
        <>
          <View style={styles.topBar}>
            <View style={styles.searchBox}>
              <Text style={styles.searchText}>Search system activity...</Text>
              <MaterialIcons name="search" size={18} color={APP_COLORS.textMuted} />
            </View>
            <View style={styles.topActions}>
              <View style={styles.iconButton}>
                <MaterialIcons name="notifications-none" size={20} color={APP_COLORS.navy} />
              </View>
              <View style={styles.avatar}>
                <MaterialIcons name="admin-panel-settings" size={22} color={APP_COLORS.white} />
              </View>
            </View>
          </View>

          <View style={styles.statGrid}>
            {statCards.map((card) => (
              <View key={card.label} style={styles.statCard}>
                <View style={styles.statIcon}>
                  <MaterialIcons name={card.icon} size={22} color={APP_COLORS.primary} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>{card.label}</Text>
                  <Text style={styles.statValue}>{card.value.toLocaleString()}</Text>
                  <Text style={styles.statDetail}>{card.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.mainGrid}>
            <View style={[styles.panel, styles.chartPanel]}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelTitle}>Document Processing Trend</Text>
                  <Text style={styles.panelSubtitle}>
                    Demo month-by-month platform activity for LexChain documents.
                  </Text>
                </View>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendPrimary]} />
                    <Text style={styles.legendText}>Processed</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendMuted]} />
                    <Text style={styles.legendText}>Pending</Text>
                  </View>
                </View>
              </View>
              <LineChart />
            </View>

            <View style={styles.scopeCard}>
              <View style={styles.scopeHeader}>
                <Text style={styles.scopeEyebrow}>Super Admin scope</Text>
                <MaterialIcons name="shield" size={22} color={APP_COLORS.white} />
              </View>
              <Text style={styles.scopeText}>
                Monitor system activity, users, document metadata, processing status,
                blockchain records, and audit events. Private legal document content
                remains controlled by document-level access and whitelist permissions.
              </Text>
              <View style={styles.scopeFooter}>
                <Text style={styles.scopeNumber}>{stats.tamper_alerts}</Text>
                <Text style={styles.scopeCaption}>tamper alerts monitored</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomGrid}>
            <View style={[styles.panel, styles.activityPanel]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Activity</Text>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendPrimary]} />
                    <Text style={styles.legendText}>Processed</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendSoft]} />
                    <Text style={styles.legendText}>Pending</Text>
                  </View>
                </View>
              </View>
              <View style={styles.barChart}>
                {ACTIVITY_DAYS.map((item) => (
                  <View key={item.day} style={styles.barItem}>
                    <View style={styles.barTrackTall}>
                      <View style={[styles.pendingBar, { height: `${item.pending}%` }]} />
                      <View style={[styles.processedBar, { height: `${item.processed}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.panel, styles.metricsPanel]}>
              <Text style={styles.panelTitle}>Operational Snapshot</Text>
              <Text style={styles.panelSubtitle}>
                Demo analytics for processed documents, category usage, verification
                results, and OCR/NLP health.
              </Text>
              <View style={styles.metricList}>
                {analytics?.map((metric) => (
                  <View key={metric.id} style={styles.metricRow}>
                    <View style={styles.metricIcon}>
                      <MaterialIcons name="analytics" size={18} color={APP_COLORS.primary} />
                    </View>
                    <View style={styles.metricBody}>
                      <View style={styles.metricHeader}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: metric.id === 'an_004' ? '18%' : '74%' }]} />
                      </View>
                      <Text style={styles.metricDetail}>{metric.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.panel, styles.pipelinePanel]}>
              <Text style={styles.panelTitle}>Processing Pipeline</Text>
              <View style={styles.pipeline}>
                {PIPELINE_ITEMS.map((item, index) => (
                  <View key={item} style={styles.pipelineItem}>
                    <View style={styles.pipelineIcon}>
                      <Text style={styles.pipelineIndex}>{index + 1}</Text>
                    </View>
                    <View style={styles.pipelineTextBlock}>
                      <Text style={styles.pipelineText}>{item}</Text>
                      <Text style={styles.pipelineStatus}>Operational</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      ) : null}
    </AdminScreenShell>
  );
}

function LineChart() {
  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" height="260" viewBox="0 0 760 260">
        {[0, 1, 2, 3].map((line) => {
          const y = 36 + line * 46;
          return (
            <Line
              key={line}
              x1="34"
              y1={y}
              x2="730"
              y2={y}
              stroke="#DCE9F8"
              strokeDasharray="6 8"
              strokeWidth="1"
            />
          );
        })}
        <Path
          d="M36 143 C80 140 84 74 126 92 C166 111 138 206 188 205 C231 204 214 122 264 116 C315 110 352 153 392 137 C443 117 431 202 492 192 C546 182 540 69 590 72 C647 76 600 216 670 203 C698 198 699 144 728 142"
          fill="none"
          stroke="#0777F2"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Path
          d="M36 166 C82 166 85 217 126 210 C166 203 145 158 188 167 C240 178 218 178 264 174 C318 170 324 137 386 126 C430 118 433 90 492 100 C540 110 524 204 582 154 C628 112 610 150 670 142 C697 138 696 111 728 108"
          fill="none"
          stroke="#B7C1CE"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Line x1="392" y1="36" x2="392" y2="224" stroke="#99CDFB" strokeDasharray="4 6" />
        <Circle cx="392" cy="137" r="8" fill="#0777F2" stroke="#FFFFFF" strokeWidth="4" />
        <Path d="M344 84 H438 Q450 84 450 96 V126 Q450 138 438 138 H344 Q332 138 332 126 V96 Q332 84 344 84 Z" fill="#0777F2" />
        <SvgText x="391" y="106" fill="#FFFFFF" fontSize="16" fontWeight="700" textAnchor="middle">
          Processed
        </SvgText>
        <SvgText x="391" y="126" fill="#FFFFFF" fontSize="18" fontWeight="800" textAnchor="middle">
          2,100
        </SvgText>
        {CHART_MONTHS.map((month, index) => (
          <SvgText
            key={month}
            x={44 + index * 62}
            y="247"
            fill="#9AAFC7"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
          >
            {month}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.white,
    borderColor: '#E5EFFA',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 42,
    minWidth: 260,
    paddingHorizontal: 14,
  },
  searchText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '600',
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.white,
    borderColor: '#E5EFFA',
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.white,
    borderColor: '#E4EEF9',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 112,
    minWidth: 260,
    padding: 18,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#F1F6FC',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  statContent: {
    flex: 1,
    gap: 3,
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  statValue: {
    color: '#111827',
    fontFamily: fonts.regular,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  statDetail: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  panel: {
    backgroundColor: APP_COLORS.white,
    borderColor: '#E4EEF9',
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  chartPanel: {
    flex: 2.2,
    minWidth: 620,
    gap: 18,
  },
  panelHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  panelTitle: {
    color: '#111827',
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
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendPrimary: {
    backgroundColor: '#0777F2',
  },
  legendMuted: {
    backgroundColor: '#B7C1CE',
  },
  legendSoft: {
    backgroundColor: '#A6D4FF',
  },
  legendText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrap: {
    minHeight: 260,
    width: '100%',
  },
  scopeCard: {
    backgroundColor: '#076BFF',
    borderRadius: 14,
    flex: 1,
    gap: 22,
    justifyContent: 'space-between',
    minHeight: 320,
    minWidth: 320,
    padding: 24,
  },
  scopeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scopeEyebrow: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  scopeText: {
    color: '#EAF4FF',
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  scopeFooter: {
    borderTopColor: 'rgba(255,255,255,0.24)',
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 18,
  },
  scopeNumber: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  scopeCaption: {
    color: '#CFE4FF',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  bottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  activityPanel: {
    flex: 1,
    gap: 22,
    minWidth: 320,
  },
  barChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 18,
    height: 190,
    justifyContent: 'space-between',
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  barTrackTall: {
    alignItems: 'center',
    backgroundColor: '#EEF5FC',
    borderRadius: 999,
    height: 150,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 14,
  },
  processedBar: {
    backgroundColor: '#0777F2',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    width: '100%',
  },
  pendingBar: {
    backgroundColor: '#9BD0FF',
    width: '100%',
  },
  barLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '700',
  },
  metricsPanel: {
    flex: 1.2,
    gap: 14,
    minWidth: 380,
  },
  metricList: {
    gap: 14,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  metricIcon: {
    alignItems: 'center',
    backgroundColor: '#F1F6FC',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  metricBody: {
    flex: 1,
    gap: 6,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricLabel: {
    color: '#111827',
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  metricValue: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  barTrack: {
    backgroundColor: '#E8EEF5',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 999,
    height: '100%',
  },
  metricDetail: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  pipelinePanel: {
    flex: 1,
    gap: 18,
    minWidth: 320,
  },
  pipeline: {
    gap: 14,
  },
  pipelineItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  pipelineIcon: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pipelineIndex: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '900',
  },
  pipelineTextBlock: {
    flex: 1,
    gap: 2,
  },
  pipelineText: {
    color: '#111827',
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  pipelineStatus: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
