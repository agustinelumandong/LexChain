import { useAdminUsers } from '../hooks';
import type { AdminUser } from '../types';
import { formatAdminDate } from './admin-screen-shell';
import { AdminResourceScreen } from './AdminResourceScreen';

export function AdminUsersScreen() {
  const usersQuery = useAdminUsers();

  return (
    <AdminResourceScreen<AdminUser>
      title="Users"
      subtitle="Manage system accounts, roles, status, and account activity."
      isLoading={usersQuery.isLoading}
      error={usersQuery.error}
      data={usersQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'status', header: 'Status' },
        {
          key: 'last_login_at',
          header: 'Last login',
          render: (row) => formatAdminDate(row.last_login_at),
        },
        { key: 'uploaded_documents', header: 'Uploaded docs' },
        { key: 'verification_attempts', header: 'Verifications' },
        {
          key: 'created_at',
          header: 'Created',
          render: (row) => formatAdminDate(row.created_at),
        },
      ]}
    />
  );
}
