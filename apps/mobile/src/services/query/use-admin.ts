import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminApi,
  type CreateInvitationRequest,
} from '@/services/api';

import { queryKeys } from './keys';

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: adminApi.getDashboard,
  });
}

export function useAdminUsersApi() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: adminApi.getUsers,
  });
}

export function useAdminInvitationsApi() {
  return useQuery({
    queryKey: queryKeys.admin.invitations,
    queryFn: adminApi.getInvitations,
  });
}

export function useCreateAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitationRequest) => adminApi.createInvitation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.invitations,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.dashboard,
      });
    },
  });
}

export function useRevokeAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => adminApi.revokeInvitation(invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.invitations,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.dashboard,
      });
    },
  });
}
