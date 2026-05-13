import { ScrollView } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';

import { AdminDataTable } from '../components/AdminDataTable';
import { useAdminDocuments } from '../hooks';
import type { AdminDocument } from '../types';
import { AdminScreenShell, formatAdminDate } from './admin-screen-shell';

export function AdminDocumentsScreen() {
  const documentsQuery = useAdminDocuments();

  return (
    <AdminScreenShell
      title="Documents"
      subtitle="Track uploaded documents and verification status."
    >
      {documentsQuery.isLoading ? <LoadingState message="Loading documents..." /> : null}
      {documentsQuery.error ? <ErrorState title="Unable to load documents" /> : null}
      {documentsQuery.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AdminDataTable<AdminDocument>
            rows={documentsQuery.data}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'file_name', header: 'File name' },
              { key: 'owner_name', header: 'Owner' },
              { key: 'status', header: 'Status' },
              {
                key: 'created_at',
                header: 'Created',
                render: (row) => formatAdminDate(row.created_at),
              },
            ]}
          />
        </ScrollView>
      ) : null}
    </AdminScreenShell>
  );
}
