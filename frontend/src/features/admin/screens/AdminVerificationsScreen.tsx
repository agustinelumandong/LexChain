import { ScrollView } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';

import { AdminDataTable } from '../components/AdminDataTable';
import { useAdminVerificationLogs } from '../hooks';
import type { AdminVerificationLog } from '../types';
import { AdminScreenShell, formatAdminDate } from './admin-screen-shell';

export function AdminVerificationsScreen() {
  const logsQuery = useAdminVerificationLogs();

  return (
    <AdminScreenShell
      title="Verifications"
      subtitle="Monitor public verification attempts and document status."
    >
      {logsQuery.isLoading ? <LoadingState message="Loading verification logs..." /> : null}
      {logsQuery.error ? <ErrorState title="Unable to load verification logs" /> : null}
      {logsQuery.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AdminDataTable<AdminVerificationLog>
            rows={logsQuery.data}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'verification_code', header: 'Code' },
              { key: 'document_id', header: 'Document ID' },
              { key: 'status', header: 'Status' },
              {
                key: 'verified_at',
                header: 'Verified',
                render: (row) => formatAdminDate(row.verified_at),
              },
            ]}
          />
        </ScrollView>
      ) : null}
    </AdminScreenShell>
  );
}
