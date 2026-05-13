import { useQuery } from '@tanstack/react-query';

import {
  getAdminDocuments,
  getAdminStats,
  getAdminUsers,
  getAdminVerificationLogs,
} from './api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  });
}

export function useAdminDocuments() {
  return useQuery({
    queryKey: ['admin', 'documents'],
    queryFn: getAdminDocuments,
  });
}

export function useAdminVerificationLogs() {
  return useQuery({
    queryKey: ['admin', 'verification-logs'],
    queryFn: getAdminVerificationLogs,
  });
}
