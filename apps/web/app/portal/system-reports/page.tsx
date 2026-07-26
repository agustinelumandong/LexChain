import { GeneratedReportsManagementView } from "../../admin/generated-reports/generated-reports-management-view";
import { requireDocumentIssuerPage } from "../lib/issuer-page-access";

export default async function PortalSystemReportsPage() {
  await requireDocumentIssuerPage();
  return <GeneratedReportsManagementView />;
}
