import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  requestsApi,
  type CreateDocumentRequestBody,
  type ListDocumentRequestsParams,
  type ReviewRequestBody,
} from '@/services/api';

import { queryKeys } from './keys';

const DOCUMENT_REQUESTS_REFRESH_INTERVAL_MS = 30 * 1000;

export function useDocumentRequests(params?: ListDocumentRequestsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.requests.list(params),
    queryFn: () => requestsApi.list(params),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: DOCUMENT_REQUESTS_REFRESH_INTERVAL_MS,
  });
}

export function useMyDocumentRequests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: requestsApi.listMine,
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: DOCUMENT_REQUESTS_REFRESH_INTERVAL_MS,
  });
}

export function useCreateDocumentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentRequestBody) => requestsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}

export function useReviewDocumentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: ReviewRequestBody;
    }) => requestsApi.review(requestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}
