import { adminGeneratedReports } from "../admin-demo-data";
import { AdminShell } from "../admin-shell";
import { PageHeader } from "../components/page-header";
import { StatCard, StatCardData } from "../components/stat-card";
import { GeneratedReportsTable } from "./generated-reports-table";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

export default function AdminGeneratedReportsPage() {
  const readyReports = adminGeneratedReports.filter((report) => report.status === "ready").length;
  const pendingReports = adminGeneratedReports.filter((report) => report.status !== "ready").length;

  const stats: StatCardData[] = [
    { label: "Reports", value: adminGeneratedReports.length, detail: "Generated outputs", icon: <AssessmentIcon fontSize="small" />, color: "blue" },
    { label: "Ready", value: readyReports, detail: "Available for review", icon: <CheckCircleIcon fontSize="small" />, color: "green" },
    { label: "Pending", value: pendingReports, detail: "Queued or needs review", icon: <PendingActionsIcon fontSize="small" />, color: "yellow" },
  ];

  return (
    <AdminShell activeHref="/admin/generated-reports">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader
          title="Generated Reports"
          description="Review generated summaries, OCR extracts, verification reports, blockchain exports, and admin-ready records."
        />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((card) => <StatCard key={card.label} {...card} />)}
        </section>

        <GeneratedReportsTable reports={adminGeneratedReports} />
      </div>
    </AdminShell>
  );
}
