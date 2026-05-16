import { useAdminDocuments } from '../hooks';
import type { AdminDocument } from '../types';
import { formatAdminDate } from './admin-screen-shell';
import { AdminResourceScreen } from './AdminResourceScreen';

export function AdminDocumentsScreen() {
  const documentsQuery = useAdminDocuments();

  return (
    <AdminResourceScreen<AdminDocument>
      title="Documents"
      subtitle="Monitor document metadata, processing state, and anchoring state without exposing private legal content."
      notice="This page intentionally shows file metadata, owner, category, and processing status only. Protected document content should still require document-level access or whitelist permission."
      isLoading={documentsQuery.isLoading}
      error={documentsQuery.error}
      data={documentsQuery.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'file_name', header: 'File name' },
        { key: 'owner_name', header: 'Owner' },
        { key: 'category', header: 'Category' },
        { key: 'status', header: 'Status' },
        { key: 'privacy', header: 'Privacy' },
        { key: 'ocr_status', header: 'OCR' },
        { key: 'nlp_status', header: 'NLP' },
        { key: 'blockchain_status', header: 'Blockchain' },
        {
          key: 'created_at',
          header: 'Uploaded',
          render: (row) => formatAdminDate(row.created_at),
        },
      ]}
    />
  );
}
