import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  requestsApi,
  type CreateDocumentRequestBody,
  type ListDocumentRequestsParams,
  type ReviewRequestBody,
} from '@/services/api';

import { queryKeys } from './keys';

export function useDocumentRequests(params?: ListDocumentRequestsParams) {
  return useQuery({
    queryKey: queryKeys.requests.list(params),
    queryFn: () => requestsApi.list(params),
  });
}

export function useMyDocumentRequests() {
  return useQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: requestsApi.listMine,
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
