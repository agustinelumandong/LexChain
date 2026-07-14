import type { PortalUiRole } from "./portal-role";

export type PortalDocument = {
  status?: string | null;
  on_chain?: boolean | null;
};

export type PortalNavigationItem = {
  label: string;
  href: string;
};

export type DashboardMetric = readonly [label: string, value: number];

export function getPortalNavigation(role: PortalUiRole): PortalNavigationItem[] {
  if (role === "issuer") {
    return [
      { label: "Dashboard", href: "/portal/dashboard" },
      { label: "Documents", href: "/portal/documents" },
      { label: "Books", href: "/portal/books" },
      { label: "Profile & Security", href: "/portal/profile" },
    ];
  }

  return [
    { label: "Shared Documents", href: "/portal/documents" },
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
