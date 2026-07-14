import type { ComponentType } from "react";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import type { PortalNavigationItem } from "../lib/portal-dashboard";

type PortalNavigationIcon = ComponentType<{ fontSize?: "small" }>;

const iconsByLabel: Record<string, PortalNavigationIcon> = {
  Dashboard: HomeIcon,
  Documents: DescriptionIcon,
  "Shared Documents": DescriptionIcon,
  "Profile & Security": PersonIcon,
};

export function getPortalNavigationIcon(item: PortalNavigationItem): PortalNavigationIcon {
  return iconsByLabel[item.label] ?? DescriptionIcon;
}
