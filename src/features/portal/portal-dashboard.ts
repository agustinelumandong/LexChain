import type { PortalUiRole } from "@/features/access";
import { getDocumentStatusLabel } from "@/features/documents";

export type PortalDocument = {
  status?: string | null;
  on_chain?: boolean | null;
};

export type PortalNavigationItem = {
  label: string;
  /** Visible bottom-nav text; must be part of `label` so the spoken name still matches. */
  shortLabel?: string;
  href: string;
};

export type PortalNavigationGroup = {
  label: string;
  items: PortalNavigationItem[];
};

export type DashboardMetric = readonly [label: string, value: number];

export function getRecentActivityStatus(status?: string | null) {
  return getDocumentStatusLabel(status);
}

export function getStatusOverviewLabel(status?: string | null) {
  return getDocumentStatusLabel(status);
}

export function getProcessingDocuments<T extends { lifecycle: string; status?: string | null }>(documents: T[]): T[] {
  return documents.filter((document) => {
    const status = document.status?.trim().toUpperCase();
    return (document.lifecycle === 'FINALIZED' && (status === 'PROCESSING' || status === 'PENDING'))
      || (document.lifecycle === 'SIGNED' && (status === 'QUEUED' || status === 'PROCESSING' || status === 'ENRICHING'));
  });
}

export function getPortalNavigation(role: PortalUiRole): PortalNavigationGroup[] {
  if (role === "lawyer") {
    const navigation: PortalNavigationGroup[] = [
      {
        label: "Workspace",
        items: [
          { label: "Dashboard", href: "/portal/dashboard" },
          { label: "Documents", href: "/portal/documents" },
          { label: "Document Requests", shortLabel: "Requests", href: "/portal/requests" },
        ],
      },
      {
        label: "Office",
        items: [
          { label: "Books", href: "/portal/books" },
          { label: "Reports", href: "/portal/reports" },
        ],
      },
      {
        label: "System Management",
        items: [
          { label: "User Accounts", href: "/portal/users" },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Profile & Security", href: "/portal/profile" },
        ],
      },
    ];

    return navigation;
  }

  return [
    {
      label: "Workspace",
      items: [
        { label: "Shared Documents", shortLabel: "Documents", href: "/portal/documents" },
        { label: "Invitations", href: "/portal/invitations" },
        { label: "My E-copy Requests", shortLabel: "Requests", href: "/portal/requests/my" },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Profile & Security", shortLabel: "Profile", href: "/portal/profile" }],
    },
  ];
}

export function getDashboardMetrics(documents: PortalDocument[]): DashboardMetric[] {
  const processing = documents.filter(
    (document) => {
      const status = document.status?.trim().toUpperCase();
      return status === "PROCESSING" || status === "PENDING";
    },
  ).length;
  const failed = documents.filter(
    (document) => document.status?.trim().toUpperCase() === "FAILED",
  ).length;
  const metrics: DashboardMetric[] = [
    ["Total Documents", documents.length],
    ["Processing", processing],
    ["Failed Documents", failed],
  ];

  if (documents.some((document) => typeof document.on_chain === "boolean")) {
    metrics.push(["On-Chain Records", documents.filter((document) => document.on_chain).length]);
  }

  return metrics;
}
