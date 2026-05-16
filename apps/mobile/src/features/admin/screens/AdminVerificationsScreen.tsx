import { useAdminVerificationLogs } from '../hooks';
import type { AdminVerificationLog } from '../types';
import { formatAdminDate } from './admin-screen-shell';
import { AdminResourceScreen } from './AdminResourceScreen';

export function AdminVerificationsScreen() {
  const logsQuery = useAdminVerificationLogs();

  return (
    <AdminResourceScreen<AdminVerificationLog>
      title="Verification Logs"
      subtitle="Monitor verification attempts, hash comparison results, and tamper mismatch alerts."
      isLoading={logsQuery.isLoading}
      error={logsQuery.error}
      data={logsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'verification_code', header: 'Code' },
        { key: 'document_name', header: 'Document' },
        { key: 'verifier', header: 'Verifier' },
        { key: 'status', header: 'Result' },
        { key: 'blockchain_hash', header: 'Blockchain hash' },
        {
          key: 'verified_at',
          header: 'Verified',
          render: (row) => formatAdminDate(row.verified_at),
        },
      ]}
    />
  );
}
