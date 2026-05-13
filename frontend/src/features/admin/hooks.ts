import {
  getAdminAnalytics,
  getAdminAuditLogs,
  getAdminBlockchainRecords,
  getAdminCategories,
  getAdminDocuments,
  getAdminInvitations,
  getAdminIssuers,
  getAdminProcessingLogs,
  getAdminStats,
  getAdminSettings,
  getAdminUsers,
  getAdminVerificationLogs,
} from './api';

type DemoQueryResult<T> = {
  data: T;
  error: null;
  isLoading: false;
};

function useDemoQuery<T>(data: T): DemoQueryResult<T> {
  return {
    data,
    error: null,
    isLoading: false,
  };
}

export function useAdminStats() {
  return useDemoQuery(getAdminStats());
}

export function useAdminUsers() {
  return useDemoQuery(getAdminUsers());
}

export function useAdminDocuments() {
  return useDemoQuery(getAdminDocuments());
}

export function useAdminVerificationLogs() {
  return useDemoQuery(getAdminVerificationLogs());
}

export function useAdminIssuers() {
  return useDemoQuery(getAdminIssuers());
}

export function useAdminCategories() {
  return useDemoQuery(getAdminCategories());
}

export function useAdminInvitations() {
  return useDemoQuery(getAdminInvitations());
}

export function useAdminBlockchainRecords() {
  return useDemoQuery(getAdminBlockchainRecords());
}

export function useAdminProcessingLogs() {
  return useDemoQuery(getAdminProcessingLogs());
}

export function useAdminAnalytics() {
  return useDemoQuery(getAdminAnalytics());
}

export function useAdminAuditLogs() {
  return useDemoQuery(getAdminAuditLogs());
}

export function useAdminSettings() {
  return useDemoQuery(getAdminSettings());
}
