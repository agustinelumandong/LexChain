import type { PortalUiRole } from "./portal-role";
import { getDocumentStatusLabel } from "./document-ui";

export type PortalDocument = {
  status?: string | null;
  on_chain?: boolean | null;
};

export type PortalNavigationItem = {
  label: string;
  href: string;
};

export type DashboardMetric = readonly [label: string, value: number];

export function getRecentActivityStatus(status?: string | null) {
  return getDocumentStatusLabel(status);
}

export function getStatusOverviewLabel(status?: string | null) {
  return getDocumentStatusLabel(status);
}

export function getPortalNavigation(role: PortalUiRole): PortalNavigationItem[] {
  if (role === "issuer") {
    return [
      { label: "Dashboard", href: "/portal/dashboard" },
      { label: "Documents", href: "/portal/documents" },
      { label: "Upload Document", href: "/portal/upload" },
      { label: "Notifications", href: "/portal/notifications" },
      { label: "Profile & Security", href: "/portal/profile" },
    ];
  }

  return [
    { label: "Shared Documents", href: "/portal/documents" },
    { label: "Invitations", href: "/portal/invitations" },
    { label: "My E-copy Requests", href: "/portal/requests/my" },
    { label: "Profile & Security", href: "/portal/profile" },
  ];
}

export function getDashboardMetrics(documents: PortalDocument[]): DashboardMetric[] {
  const processing = documents.filter(
    (document) => {
      const status = document.status?.trim().toUpperCase();
      return status === "PROCESSING" || status === "PENDING";
    },
  ).length;
  const ready = documents.filter((document) => {
    const status = document.status?.trim().toUpperCase();
    return status === "COMPLETED" || status === "ANCHORED";
  }).length;
  const metrics: DashboardMetric[] = [
    ["Total Documents", documents.length],
    ["Processing", processing],
    ["Ready Documents", ready],
  ];

  if (documents.some((document) => typeof document.on_chain === "boolean")) {
    metrics.push(["On-Chain Records", documents.filter((document) => document.on_chain).length]);
  }

  return metrics;
}
