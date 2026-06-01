import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type AskChatMessage,
  documentsApi,
  type AddPartyRequest,
  type AskResponse,
  type GlobalSearchPayload,
  type ListDocumentsParams,
} from '@/services/api';
import type { PickedUploadFile } from '@/types';

import { queryKeys } from './keys';

export function useDocuments(params?: ListDocumentsParams) {
  return useQuery({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => documentsApi.list(params),
  });
}

export function useDocument(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ''),
    queryFn: () => documentsApi.getById(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      file,
      fileName,
    }: {
      bookId: string;
      file: PickedUploadFile;
      fileName: string;
    }) => documentsApi.upload(file, fileName, bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useUpdateDocumentVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      file,
      fileName,
    }: {
      documentId: string;
      file: PickedUploadFile;
      fileName: string;
    }) => documentsApi.updateVersion(documentId, file, fileName),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.versions(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useDocumentVersions(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.versions(documentId ?? ''),
    queryFn: () => documentsApi.getVersions(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useDocumentAuditLogs(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.auditLogs(documentId ?? ''),
    queryFn: () => documentsApi.getAuditLogs(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useGlobalSearch(payload: GlobalSearchPayload, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.documents.search(payload.query),
    queryFn: () => documentsApi.globalSearch(payload),
    enabled,
  });
}

export function useSearchDocument(documentId: string, query: string) {
  return useQuery({
    queryKey: queryKeys.documents.documentSearch(documentId, query),
    queryFn: () => documentsApi.search(documentId, query),
    enabled: Boolean(documentId) && query.trim().length > 0,
  });
}

export function useRenameDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, fileName }: { documentId: string; fileName: string }) =>
      documentsApi.rename(documentId, fileName),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useAskDocument() {
  return useMutation<
    AskResponse,
    Error,
    { documentId: string; question: string; history?: AskChatMessage[] }
  >({
    mutationFn: ({ documentId, question, history }) =>
      documentsApi.ask(documentId, question, history),
  });
}

export function usePendingDocumentInvitations() {
  return useQuery({
    queryKey: queryKeys.documents.invitations,
    queryFn: documentsApi.getPendingInvitations,
  });
}

export function useAcceptDocumentInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: { documentId: string }) =>
      documentsApi.acceptInvitation(documentId),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.invitations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useRejectDocumentInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: { documentId: string }) =>
      documentsApi.rejectInvitation(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.invitations });
    },
  });
}

export function useDocumentParties(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.parties(documentId ?? ''),
    queryFn: () => documentsApi.getParties(documentId ?? ''),
    enabled: Boolean(documentId),
  });
}

export function useAddDocumentParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: string;
      payload: AddPartyRequest;
    }) => documentsApi.addParty(documentId, payload),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.parties(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
    },
  });
}

export function useRemoveDocumentParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      partyUserId,
    }: {
      documentId: string;
      partyUserId: string;
    }) => documentsApi.removeParty(documentId, partyUserId),
    onSuccess: (_, { documentId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.parties(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) });
    },
  });
}
