import type { ComponentType } from "react";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import type { PortalNavigationItem } from "@/features/portal";

type PortalNavigationIcon = ComponentType<{ fontSize?: "small" }>;

const iconsByLabel: Record<string, PortalNavigationIcon> = {
  Dashboard: HomeIcon,
  Documents: DescriptionIcon,
  "Document Requests": MoveToInboxOutlinedIcon,
  Reports: AssessmentOutlinedIcon,
  Books: MenuBookIcon,
  "Shared Documents": DescriptionIcon,
  "My E-copy Requests": FileCopyOutlinedIcon,
  Invitations: EmailOutlinedIcon,
  "Profile & Security": PersonIcon,
  "Upload Document": FileUploadIcon,
  Notifications: NotificationsNoneOutlinedIcon,
  "Office Settings": SettingsIcon,
  "User Accounts": PeopleIcon,
  "Audit Logs": ScheduleIcon,
};

export function isPortalRouteActive(pathname: string, item: PortalNavigationItem): boolean {
  if (item.href === '/portal/requests' && pathname.startsWith('/portal/requests/my')) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getPortalNavigationIcon(item: PortalNavigationItem): PortalNavigationIcon {
  return iconsByLabel[item.label] ?? DescriptionIcon;
}
