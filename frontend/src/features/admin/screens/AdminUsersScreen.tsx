import { ScrollView } from 'react-native';

import { ErrorState, LoadingState } from '@/ui';

import { AdminDataTable } from '../components/AdminDataTable';
import { useAdminUsers } from '../hooks';
import type { AdminUser } from '../types';
import { AdminScreenShell, formatAdminDate } from './admin-screen-shell';

export function AdminUsersScreen() {
  const usersQuery = useAdminUsers();

  return (
    <AdminScreenShell
      title="Users"
      subtitle="Review users, roles, and account status."
    >
      {usersQuery.isLoading ? <LoadingState message="Loading users..." /> : null}
      {usersQuery.error ? <ErrorState title="Unable to load users" /> : null}
      {usersQuery.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AdminDataTable<AdminUser>
            rows={usersQuery.data}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'role', header: 'Role' },
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
