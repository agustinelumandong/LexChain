'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portalFetch, portalRequest } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui';
import { PageLoadingSkeleton } from '@/shared/components/ui/page-loading-skeleton';
import { Modal } from '@/features/admin/components/modal';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

import { formatEcopyDeliveryStatus, formatEcopyRequestStatus } from '@/features/access/ecopy-status';

type EcopyRequest = ApiSchema<'EcopyRequestResponse'>;

function statusVariant(status: string) {
  const normalized = status.trim().toUpperCase();
  return normalized === 'APPROVED' ? 'success' : normalized === 'DECLINED' ? 'danger' : normalized === 'PENDING' ? 'warning' : 'default';
}

function PersonalRequestCard({ request }: { request: EcopyRequest }) {
  const date = request.requested_at ? new Date(request.requested_at) : null;
  const requested = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : null;
  return <Card className="space-y-4 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h2 className="break-words text-base font-bold text-[#0C2B49]"><Link className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]" href={`/portal/documents/${encodeURIComponent(request.document_id)}`}>{request.file_name}</Link></h2>{requested && <p className="mt-1 text-sm text-[#5B6F8A]">Requested {requested}</p>}</div>
      <Badge variant={statusVariant(request.status)} dot><span className="sr-only">Status: </span>{formatEcopyRequestStatus(request.status)}</Badge>
    </div>
    {request.delivery_status && <p className="text-sm text-[#4B6382]">Email delivery: {formatEcopyDeliveryStatus(request.delivery_status)}</p>}
    {request.decline_reason && <p className="break-words text-sm text-[#4B6382]">Reason: {request.decline_reason}</p>}
    {request.can_download && <a className="inline-flex min-h-11 items-center rounded-full bg-[#0067B3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]" href={`/api/portal/documents/${encodeURIComponent(request.document_id)}/file?download=1`} download>Download approved e-copy</a>}
  </Card>;
}

async function act(path: string, reason?: string): Promise<void> {
  await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(path)}`, { method: 'POST', ...(reason !== undefined ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: reason.trim() || null }) } : {}) });
}

export function EcopyRequests({ mode }: { mode: 'mine' | 'review' }) {
  const client = useQueryClient();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [requestToApprove, setRequestToApprove] = useState<EcopyRequest | null>(null);
  const path = mode === 'mine' ? '/documents/ecopy-requests/mine' : '/documents/ecopy-requests';
  const query = useQuery({ queryKey: ['ecopy-requests', mode], queryFn: () => portalFetch<ApiSchema<'EcopyRequestListResponse'>>(path) });
  const mutation = useMutation({
    mutationFn: ({ request, action }: { request: EcopyRequest; action: 'approve' | 'decline' | 'retry-delivery' }) => act(`/documents/${encodeURIComponent(request.document_id)}/ecopy-requests/${encodeURIComponent(request.id)}/${action}`, action === 'decline' ? reasons[request.id] ?? '' : undefined),
    onSuccess: () => client.invalidateQueries({ queryKey: ['ecopy-requests'] }),
    onSettled: () => setRequestToApprove(null),
  });
  if (query.isPending) return <PageLoadingSkeleton label="Loading requests…" showHeader={false} rowClassName="h-32" />;
  if (query.isError) return <div role="alert">Could not load requests. <button type="button" onClick={() => void query.refetch()}>Retry</button></div>;
  return <div className="space-y-4">
    {query.data.requests.length === 0 && (
      <EmptyState
        icon={<HistoryOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
        title="No e-copy requests yet."
        description={
          mode === 'mine'
            ? 'When you request an electronic copy of a document, your request will appear here.'
            : 'When parties request an electronic copy, request decisions and delivery records will appear here.'
        }
      />
    )}
    {query.data.requests.map((request) => mode === 'mine' ? <PersonalRequestCard key={request.id} request={request} /> : <Card key={request.id} className="space-y-4 text-[#0C2B49] shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-base font-bold"><Link className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]" href={`/portal/documents/${encodeURIComponent(request.document_id)}`}>{request.file_name}</Link></h2><p className="mt-1 break-words text-sm text-[#5B6F8A]">{request.client_name} ({request.client_email})</p></div><Badge variant={statusVariant(request.status)} dot><span className="sr-only">Status: </span>{formatEcopyRequestStatus(request.status)}</Badge></div>
      {request.delivery_status && <p className="text-sm text-[#4B6382]">Email delivery: {formatEcopyDeliveryStatus(request.delivery_status)}{request.delivery_error ? ` (${request.delivery_error})` : ''}</p>}
      {request.decline_reason && <p className="break-words text-sm text-[#4B6382]">Reason: {request.decline_reason}</p>}
      {request.status === 'PENDING' && <div className="max-w-xl"><Input label="Decline reason (optional)" value={reasons[request.id] ?? ''} onChange={(event) => setReasons({ ...reasons, [request.id]: event.target.value })} /></div>}
      {mutation.isError && mutation.variables?.request.id === request.id && <p role="alert" className="text-sm font-semibold text-[#B42318]">{mutation.error instanceof Error ? mutation.error.message : 'Could not update the request.'}</p>}
      <div className="flex flex-wrap gap-3">
        {request.status === 'PENDING' && <><Button disabled={mutation.isPending} onClick={() => setRequestToApprove(request)}>Approve</Button><Button variant="secondary" disabled={mutation.isPending} onClick={() => mutation.mutate({ request, action: 'decline' })}>Decline</Button></>}
        {request.can_retry_delivery && <Button variant="secondary" disabled={mutation.isPending} onClick={() => mutation.mutate({ request, action: 'retry-delivery' })}>Retry email delivery</Button>}
      </div>
    </Card>)}
    <Modal open={Boolean(requestToApprove)} onClose={() => { if (!mutation.isPending) setRequestToApprove(null); }} title="Approve e-copy?">
      {requestToApprove && <div className="space-y-4">
        <p className="text-sm leading-6 text-[#4B6382]">An unwatermarked copy of {requestToApprove.file_name} will be sent to {requestToApprove.client_email}.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={mutation.isPending} onClick={() => setRequestToApprove(null)}>Cancel</Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ request: requestToApprove, action: 'approve' })}>{mutation.isPending ? 'Approving…' : 'Approve and send'}</Button>
        </div>
      </div>}
    </Modal>
  </div>;
}
