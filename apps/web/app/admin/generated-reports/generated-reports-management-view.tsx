"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedIcon from "@mui/icons-material/Verified";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import ArticleIcon from "@mui/icons-material/Article";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import { Dropdown } from "../components/dropdown";
import { Field, MockModal, exportMockRows, inputClassName, useMockToast } from "../components/mock-ui";

type GeneratedReport = {
  id: string;
  title: string;
  type: string;
  source: string;
  status: string;
  generated_by: string;
  generated_at: string;
};

type ReportRow = GeneratedReport & {
  typeLabel: string;
  category: "summary" | "ocr" | "verification" | "blockchain" | "scheduled" | "failed";
  statusLabel: "Ready" | "Scheduled" | "Failed";
  createdLabel: string;
  format: "PDF" | "TXT" | "CSV";
  generatorInitials: string;
};

const reportActivity = [
  { label: "Contract Summary Report generated", time: "12m ago", icon: <DescriptionIcon fontSize="small" />, color: "text-[#16A34A]" },
  { label: "Affidavit OCR Extract completed", time: "35m ago", icon: <TextSnippetIcon fontSize="small" />, color: "text-[#7C3AED]" },
  { label: "On-Chain Anchor Export ready", time: "2h ago", icon: <Inventory2Icon fontSize="small" />, color: "text-[#0879D8]" },
  { label: "Employment Contract Summary queued", time: "3h ago", icon: <ScheduleIcon fontSize="small" />, color: "text-[#F59E0B]" },
  { label: "Resolution OCR Extract failed", time: "5h ago", icon: <WarningAmberIcon fontSize="small" />, color: "text-[#EF4444]" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getCategory(type: string, status: string): ReportRow["category"] {
  const value = `${type} ${status}`.toLowerCase();
  if (value.includes("queued") || value.includes("scheduled")) return "scheduled";
  if (value.includes("review") || value.includes("failed")) return "failed";
  if (value.includes("ocr")) return "ocr";
  if (value.includes("verification")) return "verification";
  if (value.includes("blockchain")) return "blockchain";
  return "summary";
}

function getStatus(status: string): ReportRow["statusLabel"] {
  if (status === "queued") return "Scheduled";
  if (status === "review_needed" || status === "failed") return "Failed";
  return "Ready";
}

function getFormat(category: ReportRow["category"], index: number): ReportRow["format"] {
  if (category === "ocr") return "TXT";
  if (category === "blockchain") return "CSV";
  return index % 3 === 1 ? "TXT" : "PDF";
}

function formatRelativeDate(value: string, fallbackIndex: number) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return `${fallbackIndex + 1}h ago`;
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))}m ago`;
  if (diff < day) return `${Math.round(diff / hour)}h ago`;
  return `${Math.round(diff / day)}d ago`;
}

function getInitials(name: string) {
  if (name.toLowerCase() === "system") return "SY";
  const parts = name.replace("Atty.", "").trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function enrichReport(report: GeneratedReport, index: number): ReportRow {
  const category = getCategory(report.type, report.status);
  return {
    ...report,
    category,
    typeLabel: report.type.replace("NLP Summary", "Summary").replace("OCR Extraction", "OCR Extract"),
    statusLabel: getStatus(report.status),
    createdLabel: formatRelativeDate(report.generated_at, index),
    format: getFormat(category, index),
    generatorInitials: getInitials(report.generated_by),
  };
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: "blue" | "green" | "purple" | "orange" | "yellow" | "red" }) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#0879D8]",
    green: "bg-[#EAFBF1] text-[#16A34A]",
    purple: "bg-[#F4ECFF] text-[#7C3AED]",
    orange: "bg-[#FFF1E8] text-[#F97316]",
    yellow: "bg-[#FFF7E6] text-[#F59E0B]",
    red: "bg-[#FEECEC] text-[#EF4444]",
  };

  return (
    <article className="flex min-h-[112px] items-center gap-3 rounded-2xl border border-[#E4EEF9] bg-white p-4 shadow-sm shadow-[#DDEAF7]/40 transition hover:-translate-y-0.5 hover:border-[#C7DBEF]">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tones[tone])}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-[#4B6382]">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none text-[#071B33]">{value.toLocaleString()}</p>
        <p className="mt-2 truncate text-xs font-semibold text-[#5B6F8A]">{detail}</p>
      </div>
    </article>
  );
}

function TypeBadge({ report }: { report: ReportRow }) {
  const styles = {
    summary: "bg-[#EAFBF1] text-[#16A34A]",
    ocr: "bg-[#F4ECFF] text-[#7C3AED]",
    verification: "bg-[#FFF1E8] text-[#F97316]",
    blockchain: "bg-[#EAF3FF] text-[#0879D8]",
    scheduled: "bg-[#FFF7E6] text-[#D97706]",
    failed: "bg-[#FEECEC] text-[#EF4444]",
  };

  return <span className={cn("rounded-lg px-2.5 py-1 text-xs font-black", styles[report.category])}>{report.typeLabel}</span>;
}

function StatusBadge({ status }: { status: ReportRow["statusLabel"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-black", status === "Ready" && "text-[#16A34A]", status === "Scheduled" && "text-[#D97706]", status === "Failed" && "text-[#EF4444]")}>
      <span className="size-2 rounded-full bg-current" />
      {status}
    </span>
  );
}

function FormatBadge({ format }: { format: ReportRow["format"] }) {
  return (
    <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-black", format === "PDF" && "border-[#FCA5A5] text-[#EF4444]", format === "TXT" && "border-[#CBD5E1] text-[#475569]", format === "CSV" && "border-[#86EFAC] text-[#16A34A]")}>
      {format}
    </span>
  );
}

function ActionsMenu({ report, onView, onDownload, onRegenerate, onArchive }: { report: ReportRow; onView: () => void; onDownload: () => void; onRegenerate: () => void; onArchive: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-end gap-2">
      <button type="button" onClick={onView} aria-label={`View ${report.title}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" onClick={onDownload} aria-label={`Download ${report.title}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><DownloadIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" onClick={onRegenerate} aria-label={`Regenerate ${report.title}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><CachedIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" aria-label={`More actions for ${report.title}`} onClick={() => setOpen((value) => !value)} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><MoreVertIcon sx={{ fontSize: 18 }} /></button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-xl shadow-[#183B6B]/10">
          <button type="button" onClick={() => { setOpen(false); onView(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">Open details</button>
          <button type="button" onClick={() => { setOpen(false); onRegenerate(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">Schedule refresh</button>
          <button type="button" onClick={() => { setOpen(false); onArchive(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">Archive</button>
        </div>
      ) : null}
    </div>
  );
}

function ReportBreakdown({ reports }: { reports: ReportRow[] }) {
  const total = Math.max(1, reports.length);
  const groups = [
    { label: "Summaries", category: "summary", color: "#41B96B" },
    { label: "OCR Extracts", category: "ocr", color: "#9B6AF3" },
    { label: "Verification", category: "verification", color: "#F97316" },
    { label: "Blockchain", category: "blockchain", color: "#0879D8" },
    { label: "Scheduled", category: "scheduled", color: "#F6B52E" },
    { label: "Failed", category: "failed", color: "#EF4444" },
  ] as const;
  let cursor = 0;
  const gradient = groups.map((group) => {
    const count = reports.filter((report) => report.category === group.category).length;
    const start = cursor;
    cursor += (count / total) * 100;
    return `${group.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <article className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <h2 className="mb-4 text-lg font-black text-[#071B33]">Report Breakdown</h2>
      <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
        <div className="relative mx-auto size-34 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total Reports</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {groups.map((group) => {
            const count = reports.filter((report) => report.category === group.category).length;
            return (
              <div key={group.category} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="min-w-0 flex-1 font-semibold text-[#0C2B49]">{group.label}</span>
                <strong className="font-black text-[#071B33]">{count}</strong>
                <span className="text-xs font-semibold text-[#5B6F8A]">({Math.round((count / total) * 100)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function ActivityPanel() {
  return (
    <article className="flex min-h-[240px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Recent Report Activity</h2>
        <Link href="/admin/audit-logs" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View logs</Link>
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {reportActivity.map((item) => (
          <div key={item.label} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-xl py-1.5 transition hover:bg-[#F8FBFF]">
            <span className={item.color}>{item.icon}</span>
            <span className="truncate text-sm font-semibold text-[#0C2B49]">{item.label}</span>
            <span className="text-xs font-semibold text-[#5B6F8A]">{item.time}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function GeneratedReportsManagementView({ reports }: { reports: GeneratedReport[] }) {
  const { showToast } = useMockToast();
  const [reportRows, setReportRows] = useState(reports);
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pageSize, setPageSize] = useState("10");
  const [page, setPage] = useState(0);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "archive" | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [draftReport, setDraftReport] = useState<GeneratedReport>({
    id: "rpt_draft",
    title: "",
    type: "NLP Summary",
    source: "",
    status: "queued",
    generated_by: "LexChain Admin",
    generated_at: new Date().toISOString(),
  });

  const rows = useMemo(() => reportRows.map(enrichReport), [reportRows]);
  const typeOptions = useMemo(() => [...new Set(rows.map((report) => report.typeLabel))], [rows]);
  const totalDisplay = Math.max(rows.length, 248);
  const categories = {
    summary: rows.filter((report) => report.category === "summary").length,
    ocr: rows.filter((report) => report.category === "ocr").length,
    verification: rows.filter((report) => report.category === "verification").length,
    blockchain: rows.filter((report) => report.category === "blockchain").length,
    scheduled: rows.filter((report) => report.statusLabel === "Scheduled").length,
    failed: rows.filter((report) => report.statusLabel === "Failed").length,
  };

  const filtered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return rows.filter((report) => {
      const matchesSearch = !query || report.title.toLowerCase().includes(query) || report.source.toLowerCase().includes(query) || report.generated_by.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || report.typeLabel === typeFilter;
      const matchesStatus = statusFilter === "all" || report.statusLabel === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [headerSearch, rows, statusFilter, tableSearch, typeFilter]);

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleReports = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  const metrics = [
    { label: "Total Reports", value: totalDisplay, detail: "All generated files", icon: <AssessmentIcon fontSize="small" />, tone: "blue" as const },
    { label: "Summaries", value: Math.max(categories.summary, 86), detail: "NLP summaries", icon: <DescriptionIcon fontSize="small" />, tone: "green" as const },
    { label: "OCR Extracts", value: Math.max(categories.ocr, 74), detail: "Text extraction outputs", icon: <TextSnippetIcon fontSize="small" />, tone: "purple" as const },
    { label: "Verification Reports", value: Math.max(categories.verification, 42), detail: "Integrity result files", icon: <VerifiedIcon fontSize="small" />, tone: "orange" as const },
    { label: "Blockchain Exports", value: Math.max(categories.blockchain, 29), detail: "On-chain records", icon: <Inventory2Icon fontSize="small" />, tone: "blue" as const },
    { label: "Scheduled", value: Math.max(categories.scheduled, 11), detail: "Queued report jobs", icon: <ScheduleIcon fontSize="small" />, tone: "yellow" as const },
    { label: "Failed", value: Math.max(categories.failed, 6), detail: "Needs regeneration", icon: <WarningAmberIcon fontSize="small" />, tone: "red" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Operations</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Generated Reports</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Review generated summaries, OCR extracts, verification reports, blockchain exports, and admin-ready records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[330px] items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 shadow-sm shadow-[#DDEAF7]/35 focus-within:border-[#0985E7]">
            <SearchIcon fontSize="small" className="text-[#4B6382]" />
            <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} placeholder="Search reports by type, document, or issuer..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
          </label>
          <button type="button" onClick={() => { setMoreFiltersOpen((value) => !value); showToast({ title: "Filters toggled", detail: "Use the report filters below.", tone: "info" }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
          <button type="button" onClick={() => { exportMockRows("lexchain-generated-reports", filtered, "csv"); showToast({ title: "Reports exported", detail: `${filtered.length} reports downloaded.` }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <button type="button" onClick={() => {
            setDraftReport({ id: `rpt_${Date.now()}`, title: "", type: "NLP Summary", source: "", status: "queued", generated_by: "LexChain Admin", generated_at: new Date().toISOString() });
            setModalMode("create");
          }} className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0985E7]/25 transition hover:bg-[#0770C4]">
            <AddIcon fontSize="small" />
            Generate Report
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:min-h-0">
          <div className="border-b border-[#E4EEF9] p-5">
            <h2 className="text-lg font-black text-[#071B33]">Report Library</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7]">
                <SearchIcon fontSize="small" className="text-[#4B6382]" />
                <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search reports..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
              </label>
              <Dropdown value={typeFilter} onChange={setTypeFilter} options={[{ label: "Type", value: "all" }, ...typeOptions.map((type) => ({ label: type, value: type }))]} />
              <Dropdown value={statusFilter} onChange={setStatusFilter} options={[{ label: "Status", value: "all" }, { label: "Ready", value: "Ready" }, { label: "Scheduled", value: "Scheduled" }, { label: "Failed", value: "Failed" }]} />
              <Dropdown value={dateFilter} onChange={setDateFilter} options={[{ label: "Date Range", value: "all" }, { label: "Today", value: "today" }, { label: "7 Days", value: "week" }, { label: "30 Days", value: "month" }]} />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <SettingsIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead>
                <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                  <th className="px-5 py-3">Report Name</th>
                  <th className="px-5 py-3">Source Document</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Generated By</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleReports.map((report, index) => (
                  <tr key={report.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xl", report.category === "summary" && "text-[#16A34A]", report.category === "ocr" && "text-[#7C3AED]", report.category === "verification" && "text-[#F97316]", report.category === "blockchain" && "text-[#0879D8]", report.category === "scheduled" && "text-[#D97706]", report.category === "failed" && "text-[#EF4444]")}>
                          {report.category === "ocr" ? <TextSnippetIcon fontSize="small" /> : report.category === "verification" ? <VerifiedIcon fontSize="small" /> : report.category === "blockchain" ? <Inventory2Icon fontSize="small" /> : <ArticleIcon fontSize="small" />}
                        </span>
                        <span className="font-black text-[#071B33]">{report.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2 font-semibold text-[#4B6382]"><DescriptionIcon sx={{ fontSize: 17 }} className="text-[#EF4444]" />{report.source}</span>
                    </td>
                    <td className="px-5 py-3"><TypeBadge report={report} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("flex size-8 items-center justify-center rounded-full text-xs font-black", report.generated_by === "System" ? "bg-[#EEF4FB] text-[#64748B]" : index % 2 === 0 ? "bg-[#EAF3FF] text-[#0879D8]" : "bg-[#FFF1E8] text-[#F97316]")}>{report.generated_by === "System" ? <SettingsIcon sx={{ fontSize: 16 }} /> : report.generatorInitials}</span>
                        <span className="font-semibold text-[#0C2B49]">{report.generated_by}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={report.statusLabel} /></td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{report.createdLabel}</td>
                    <td className="px-5 py-3"><FormatBadge format={report.format} /></td>
                    <td className="px-5 py-3">
                      <ActionsMenu
                        report={report}
                        onView={() => { setSelectedReport(report); setModalMode("view"); }}
                        onDownload={() => { exportMockRows(`report-${report.id}`, [report], "json"); showToast({ title: "Report downloaded", detail: report.title }); }}
                        onRegenerate={() => {
                          setReportRows((current) => current.map((row) => row.id === report.id ? { ...row, status: "ready", generated_at: new Date().toISOString() } : row));
                          showToast({ title: "Report regenerated", detail: report.title });
                        }}
                        onArchive={() => { setSelectedReport(report); setModalMode("archive"); }}
                      />
                    </td>
                  </tr>
                ))}
                {visibleReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No reports match the current filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#5B6F8A]">
              Showing {filtered.length === 0 ? 0 : safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length} reports
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">‹</button>
              {[...Array(Math.min(3, totalPages))].map((_, index) => (
                <button key={index} type="button" onClick={() => setPage(index)} className={cn("size-9 rounded-lg border text-sm font-black transition", safePage === index ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] text-[#0C2B49] hover:bg-[#EEF4FB]")}>{index + 1}</button>
              ))}
              {totalPages > 3 && <span className="px-2 text-sm font-black text-[#5B6F8A]">...</span>}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={safePage >= totalPages - 1} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">›</button>
              <Dropdown value={pageSize} onChange={setPageSize} options={[{ label: "10 / page", value: "10" }, { label: "20 / page", value: "20" }]} />
            </div>
          </div>
        </article>

        <aside className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <ReportBreakdown reports={rows} />
          <ActivityPanel />
        </aside>
      </section>
      <MockModal
        open={modalMode === "create"}
        onClose={() => setModalMode(null)}
        title="Generate Report"
        description="Creates a session-only mock report."
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalMode(null)} className="flex-1 rounded-xl border border-[#E4EEF9] px-5 py-3 text-sm font-black text-[#0C2B49]">Cancel</button>
            <button type="button" onClick={() => {
              if (!draftReport.title.trim()) return;
              setReportRows((current) => [draftReport, ...current]);
              showToast({ title: "Report generated", detail: draftReport.title });
              setModalMode(null);
            }} className="flex-1 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white">Generate</button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="Report name"><input className={inputClassName} value={draftReport.title} onChange={(event) => setDraftReport((draft) => ({ ...draft, title: event.target.value }))} placeholder="Contract Summary Report" /></Field>
          <Field label="Source document"><input className={inputClassName} value={draftReport.source} onChange={(event) => setDraftReport((draft) => ({ ...draft, source: event.target.value }))} placeholder="Contract_Review.pdf" /></Field>
          <Field label="Type"><select className={inputClassName} value={draftReport.type} onChange={(event) => setDraftReport((draft) => ({ ...draft, type: event.target.value }))}><option>NLP Summary</option><option>OCR Extraction</option><option>Verification Report</option><option>Blockchain Export</option></select></Field>
        </div>
      </MockModal>
      <MockModal open={modalMode === "view"} onClose={() => setModalMode(null)} title={selectedReport?.title ?? "Report details"} description="Mock generated report metadata." footer={<button type="button" onClick={() => setModalMode(null)} className="w-full rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white">Done</button>}>
        {selectedReport ? <div className="space-y-3 text-sm font-semibold text-[#4B6382]"><p><strong className="text-[#071B33]">Type:</strong> {selectedReport.typeLabel}</p><p><strong className="text-[#071B33]">Source:</strong> {selectedReport.source}</p><p><strong className="text-[#071B33]">Generated by:</strong> {selectedReport.generated_by}</p><p><strong className="text-[#071B33]">Status:</strong> {selectedReport.statusLabel}</p></div> : null}
      </MockModal>
      <MockModal open={modalMode === "archive"} onClose={() => setModalMode(null)} title={`Archive ${selectedReport?.title ?? "report"}?`} description="Removes the report from this mock session." footer={<div className="flex gap-3"><button type="button" onClick={() => setModalMode(null)} className="flex-1 rounded-xl border border-[#E4EEF9] px-5 py-3 text-sm font-black text-[#0C2B49]">Cancel</button><button type="button" onClick={() => { if (!selectedReport) return; setReportRows((current) => current.filter((row) => row.id !== selectedReport.id)); showToast({ title: "Report archived", detail: selectedReport.title, tone: "warning" }); setModalMode(null); }} className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">Archive</button></div>}>
        <p className="text-sm font-semibold text-[#5B6F8A]">Refresh to restore demo data.</p>
      </MockModal>
    </div>
  );
}
