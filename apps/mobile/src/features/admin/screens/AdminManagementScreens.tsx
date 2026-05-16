import { View } from 'react-native';

import { AdminStatCard } from '../components/AdminStatCard';
import {
  useAdminAnalytics,
  useAdminAuditLogs,
  useAdminBlockchainRecords,
  useAdminCategories,
  useAdminInvitations,
  useAdminIssuers,
  useAdminProcessingLogs,
  useAdminSettings,
} from '../hooks';
import type {
  AdminAnalyticsMetric,
  AdminAuditLog,
  AdminBlockchainRecord,
  AdminCategory,
  AdminInvitationLog,
  AdminIssuer,
  AdminProcessingLog,
  AdminSystemSetting,
} from '../types';
import { formatAdminDate } from './admin-screen-shell';
import { AdminResourceScreen } from './AdminResourceScreen';

export function AdminIssuersScreen() {
  const issuersQuery = useAdminIssuers();

  return (
    <AdminResourceScreen<AdminIssuer>
      title="Document Issuers"
      subtitle="Track offices, law firms, and organizations that upload and manage legal documents."
      isLoading={issuersQuery.isLoading}
      error={issuersQuery.error}
      data={issuersQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'name', header: 'Issuer' },
        { key: 'organization_type', header: 'Type' },
        { key: 'contact_email', header: 'Contact email' },
        { key: 'active_users', header: 'Active users' },
        { key: 'documents_uploaded', header: 'Documents' },
        { key: 'status', header: 'Status' },
      ]}
    />
  );
}

export function AdminCategoriesScreen() {
  const categoriesQuery = useAdminCategories();

  return (
    <AdminResourceScreen<AdminCategory>
      title="Categories"
      subtitle="Manage document categories and the default permission rules attached to each category."
      isLoading={categoriesQuery.isLoading}
      error={categoriesQuery.error}
      data={categoriesQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'name', header: 'Category' },
        {
          key: 'publicly_verifiable',
          header: 'Publicly verifiable',
          render: (row) => (row.publicly_verifiable ? 'Yes' : 'No'),
        },
        {
          key: 'requires_invitation',
          header: 'Requires invitation',
          render: (row) => (row.requires_invitation ? 'Yes' : 'No'),
        },
        {
          key: 'allow_download',
          header: 'Allow download',
          render: (row) => (row.allow_download ? 'Yes' : 'No'),
        },
        { key: 'default_privacy', header: 'Default privacy' },
      ]}
    />
  );
}

export function AdminInvitationsPermissionsScreen() {
  const invitationsQuery = useAdminInvitations();

  return (
    <AdminResourceScreen<AdminInvitationLog>
      title="Invitations & Permissions"
      subtitle="Monitor invitations, shared documents, and permission types without replacing the document issuer workflow."
      notice="Document Issuers still invite participants for each document. Super Admin only monitors logs and can revoke abusive access as an emergency control."
      isLoading={invitationsQuery.isLoading}
      error={invitationsQuery.error}
      data={invitationsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'document_name', header: 'Document' },
        { key: 'issuer', header: 'Issuer' },
        { key: 'participant_email', header: 'Participant' },
        { key: 'permission_type', header: 'Permission' },
        { key: 'status', header: 'Status' },
        {
          key: 'sent_at',
          header: 'Sent',
          render: (row) => formatAdminDate(row.sent_at),
        },
      ]}
    />
  );
}

export function AdminBlockchainRecordsScreen() {
  const recordsQuery = useAdminBlockchainRecords();

  return (
    <AdminResourceScreen<AdminBlockchainRecord>
      title="Blockchain Records"
      subtitle="Monitor anchored hashes, transaction hashes, block numbers, network status, and failed re-anchor candidates."
      isLoading={recordsQuery.isLoading}
      error={recordsQuery.error}
      data={recordsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'document_hash', header: 'Document hash' },
        { key: 'transaction_hash', header: 'Transaction hash' },
        {
          key: 'block_number',
          header: 'Block',
          render: (row) => row.block_number ?? 'Not anchored',
        },
        { key: 'network', header: 'Network' },
        { key: 'status', header: 'Status' },
        {
          key: 'anchored_at',
          header: 'Anchored',
          render: (row) => formatAdminDate(row.anchored_at),
        },
      ]}
    />
  );
}

export function AdminProcessingScreen() {
  const processingQuery = useAdminProcessingLogs();

  return (
    <AdminResourceScreen<AdminProcessingLog>
      title="OCR / NLP Processing"
      subtitle="Monitor OCR extraction, NLP summary generation, extracted data status, processing time, and API usage."
      isLoading={processingQuery.isLoading}
      error={processingQuery.error}
      data={processingQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'document_name', header: 'Document' },
        { key: 'ocr_status', header: 'OCR status' },
        { key: 'nlp_status', header: 'NLP summary' },
        { key: 'extracted_data_status', header: 'Extracted data' },
        { key: 'processing_time', header: 'Processing time' },
        { key: 'api_usage', header: 'API usage' },
      ]}
    />
  );
}

export function AdminAnalyticsScreen() {
  const analyticsQuery = useAdminAnalytics();

  return (
    <AdminResourceScreen<AdminAnalyticsMetric>
      title="Analytics"
      subtitle="Review platform health metrics for document volume, verification results, OCR/NLP quality, storage, and anchoring."
      isLoading={analyticsQuery.isLoading}
      error={analyticsQuery.error}
      data={analyticsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'label', header: 'Metric' },
        { key: 'value', header: 'Value' },
        { key: 'detail', header: 'Insight' },
      ]}
    >
      {analyticsQuery.data ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {analyticsQuery.data.slice(0, 4).map((metric) => (
            <AdminStatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </View>
      ) : null}
    </AdminResourceScreen>
  );
}

export function AdminAuditLogsScreen() {
  const auditQuery = useAdminAuditLogs();

  return (
    <AdminResourceScreen<AdminAuditLog>
      title="Audit Logs"
      subtitle="Review security-sensitive events: logins, uploads, views, downloads, permissions, verification attempts, and admin actions."
      isLoading={auditQuery.isLoading}
      error={auditQuery.error}
      data={auditQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'actor', header: 'Actor' },
        { key: 'action', header: 'Action' },
        { key: 'target', header: 'Target' },
        { key: 'severity', header: 'Severity' },
        {
          key: 'created_at',
          header: 'Date',
          render: (row) => formatAdminDate(row.created_at),
        },
      ]}
    />
  );
}

export function AdminSystemSettingsScreen() {
  const settingsQuery = useAdminSettings();

  return (
    <AdminResourceScreen<AdminSystemSetting>
      title="System Settings"
      subtitle="Control demo-ready LexChain rules for uploads, OCR/NLP, blockchain network, verification, invitations, storage, and maintenance."
      isLoading={settingsQuery.isLoading}
      error={settingsQuery.error}
      data={settingsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'setting', header: 'Setting' },
        { key: 'value', header: 'Value' },
        { key: 'scope', header: 'Scope' },
      ]}
    />
  );
}
