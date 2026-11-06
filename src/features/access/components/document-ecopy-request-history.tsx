'use client';

import { useQuery } from '@tanstack/react-query';
import { portalFetch } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types';
import { Badge, Button, Card, type BadgeVariant } from '@/shared/components/ui';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

import { formatEcopyDeliveryStatus, formatEcopyRequestStatus } from '@/features/access/ecopy-status';

type EcopyRequest = ApiSchema<'EcopyRequestResponse'>;

const dateTimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormat.format(date);
}

function statusVariant(status: string): BadgeVariant {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'APPROVED') return 'success';
  if (normalized === 'DECLINED') return 'danger';
  if (normalized === 'PENDING') return 'warning';
  return 'default';
}

function RequestEntry({ request }: { request: EcopyRequest }) {
  return <Card className="space-y-2 p-3">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <p className="min-w-0 break-words text-sm font-semibold text-[#0C2B49]">Requested by {request.client_name || 'document party'}</p>
      <Badge variant={statusVariant(request.status)} dot><span className="sr-only">Status: </span>{formatEcopyRequestStatus(request.status)}</Badge>
    </div>
    <p className="text-sm text-[#4B6382]">Requested <time dateTime={request.requested_at}>{formatDateTime(request.requested_at)}</time></p>
    {request.decided_at && <p className="text-sm text-[#4B6382]">Decision recorded <time dateTime={request.decided_at}>{formatDateTime(request.decided_at)}</time></p>}
    {request.decline_reason && <p className="break-words text-sm text-[#4B6382]">Decline reason: {request.decline_reason}</p>}
    {request.delivery_status && <p className="text-sm text-[#4B6382]">Email delivery: {formatEcopyDeliveryStatus(request.delivery_status)}</p>}
    {request.delivery_error && <p className="break-words text-sm text-[#4B6382]">Delivery error: {request.delivery_error}</p>}
    {request.delivered_at && <p className="text-sm text-[#4B6382]">Delivered <time dateTime={request.delivered_at}>{formatDateTime(request.delivered_at)}</time></p>}
  </Card>;
}

export function DocumentEcopyRequestHistory({ documentId }: { documentId: string }) {
  const query = useQuery({
    queryKey: ['ecopy-requests', documentId],
    queryFn: async () => {
      const response = await portalFetch<ApiSchema<'EcopyRequestListResponse'>>(`/documents/${encodeURIComponent(documentId)}/ecopy-requests`);
      if (!Array.isArray(response?.requests)) throw new Error('Invalid e-copy request history response.');
      return response;
    },
  });

  return <section aria-labelledby="document-ecopy-request-history-heading" className="mt-4 border-t border-[#D7E4F2] pt-4">
    <h3 id="document-ecopy-request-history-heading" className="text-base font-bold text-[#0C2B49]">E-copy request history</h3>
    {query.isPending && <p role="status" className="mt-2 text-sm text-[#4B6382]">Loading e-copy request history…</p>}
    {query.isError && <div role="alert" className="mt-2 space-y-2 text-sm text-[#B42318]">
      <p>Could not load e-copy request history.</p>
      <Button variant="secondary" size="sm" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Retrying…' : 'Retry request history'}</Button>
    </div>}
    {query.data && !query.isError && query.data.requests.length === 0 && (
      <div className="mt-3 flex w-full flex-col items-center justify-center gap-2.5 rounded-xl bg-[#F8FBFF] px-4 py-8 text-center sm:px-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF4FF] text-[#0067B3]">
          <HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0C2B49]">No e-copy requests for this document yet.</p>
          <p className="mt-1 text-xs text-[#4B6382]">
            When parties request an electronic copy, request decisions and delivery records will appear here.
          </p>
        </div>
      </div>
    )}
    {query.data && !query.isError && query.data.requests.length > 0 && <ul className="mt-3 space-y-2">
      {query.data.requests.map((request) => <li key={request.id}><RequestEntry request={request} /></li>)}
    </ul>}
  </section>;
}
