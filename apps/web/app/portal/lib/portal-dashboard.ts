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

export type IssuerQuickActionLabel =
  | "Upload Document"
  | "Register books"
  | "Review document requests"
  | "Invite Party"
  | "Verify Document";

export type IssuerQuickAction = {
  label: IssuerQuickActionLabel;
  description: string;
  href: string;
};

export function getIssuerQuickActions(): IssuerQuickAction[] {
  return [
    { label: "Upload Document", description: "Add a new legal document", href: "/portal/upload" },
    { label: "Register books", description: "Manage physical register volumes", href: "/portal/books" },
    { label: "Review document requests", description: "Respond to participant e-copy requests", href: "/portal/requests" },
    { label: "Invite Party", description: "Invite others to collaborate", href: "/portal/documents" },
    { label: "Verify Document", description: "Verify document authenticity", href: "/portal/documents" },
  ];
}

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

export function getDashboardMetrics(
  role: PortalUiRole,
  documents: PortalDocument[],
): DashboardMetric[] {
  const processing = documents.filter(
    (document) => {
      const status = document.status?.trim().toUpperCase();
      return status === "PROCESSING" || status === "PENDING";
    },
  ).length;
  const onChain = documents.filter((document) => document.on_chain).length;

  if (role === "issuer") {
    return [
      ["Total Documents", documents.length],
      ["Processing", processing],
      ["On-Chain Records", onChain],
      ["Pending Invites", 0],
    ];
  }

  return [
    ["Shared Documents", documents.length],
    ["Processing", processing],
    ["On-Chain Records", onChain],
    ["Recent Access", 0],
  ];
}
