"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { toast } from "sonner";
import { createDemoReport, downloadReport, type Report, type ReportType } from "@/features/office/reports";
import { fetchSystemUsersReport } from "@/features/office/system-users-report";
import { PortalDropdown } from "@/features/portal/components";
import { EmptyState } from "@/shared/components/ui";

const reportOptions: ReadonlyArray<{
  type: ReportType;
  title: string;
  description: string;
}> = [
  {
    type: "system-users",
    title: "System Users",
    description: "User accounts created during the selected dates.",
  },
  {
    type: "system-audit",
    title: "System Audit",
    description: "Seeded demo audit events; live system audit reporting is not available yet.",
  },
];

const reportDatePickerSlotProps = {
  textField: { size: "small" as const, fullWidth: true, sx: { "& .MuiPickersOutlinedInput-root": { borderRadius: 3, backgroundColor: "#F8FBFF", color: "#0C2B49" } } },
  field: { clearable: true },
  popper: { disablePortal: true },
  desktopPaper: { sx: { borderRadius: 3, border: "1px solid #E4EEF9" } },
};

export function GeneratedReportsManagementView({ embedded = false, controlsTarget, onGenerated, onPendingChange, onBack, step }: { embedded?: boolean; controlsTarget?: HTMLElement | null; onGenerated?: () => void; onPendingChange?: (pending: boolean) => void; onBack?: () => void; step?: 'type' | 'dates' }) {
  const [reportType, setReportType] = useState<ReportType>("system-users");
  const [from, setFrom] = useState("2026-03-01");
  const [to, setTo] = useState("2026-05-31");
  const [report, setReport] = useState<Report>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const selected = reportOptions.find((option) => option.type === reportType) ?? reportOptions[0];
  const generated = reportOptions.find((option) => option.type === report?.reportType);

  async function generate() {
    setPending(true);
    onPendingChange?.(true);
    if (!step) setReport(undefined);
    setError("");
    try {
      const nextReport = reportType === "system-users"
        ? await fetchSystemUsersReport(from, to)
        : createDemoReport(reportType, from, to);
      setReport(nextReport);
      onGenerated?.();
    } catch (cause) {
      if (!step) setReport(undefined);
      setError(cause instanceof Error ? cause.message : "Report generation failed.");
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }

  function handleDownloadReport() {
    if (!report) return;

    try {
      downloadReport(report);
      toast.success("Report downloaded.");
    } catch {
      toast.error("Could not download the report. Please try again.", { duration: Infinity });
    }
  }

  const embeddedControls = (
        <div className="grid gap-4">
          {step !== 'dates' && <div className={step ? undefined : "rounded-2xl border border-[#E4EEF9] bg-[#F8FBFF] p-4"}>
            <div className="flex items-start gap-3">
              {!step && <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#B9DDF9] bg-white text-xs font-black text-[#0067B3]">2</span>}
              <div>
                {!step && <h3 className="text-sm font-black text-[#071B33]">Choose a system report</h3>}
                <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">{selected.description}</p>
              </div>
            </div>
            <label className="mt-4 block text-sm font-black text-[#0C2B49]">
              Report type
              <PortalDropdown
                ariaLabel="Report type"
                disabled={pending}
                value={reportType}
                onChange={(value) => { setReportType(value as ReportType); if (!step) setReport(undefined); setError(""); }}
                options={reportOptions.map((option) => ({ label: option.title, value: option.type }))}
              />
            </label>
          </div>}

          {step !== 'type' && <section aria-label="Report dates" className={step ? undefined : "rounded-2xl border border-[#E4EEF9] bg-[#F8FBFF] p-4"}>
            <div className="flex items-start gap-3">
              {!step && <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#B9DDF9] bg-white text-xs font-black text-[#0067B3]">3</span>}
              <div>
                <h3 className="text-sm font-black text-[#071B33]">Choose a date range</h3>
                <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">System Users includes the selected UTC calendar days in full.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  format="MM/DD/YYYY"
                  value={from ? dayjs(from) : null}
                  maxDate={to ? dayjs(to) : undefined}
                  disabled={pending}
                  onChange={(value, context) => { if (context.validationError) return; setFrom(value?.format("YYYY-MM-DD") ?? ""); if (!step) setReport(undefined); setError(""); }}
                  slotProps={reportDatePickerSlotProps}
                />
                <DatePicker
                  label="To"
                  format="MM/DD/YYYY"
                  value={to ? dayjs(to) : null}
                  minDate={from ? dayjs(from) : undefined}
                  disabled={pending}
                  onChange={(value, context) => { if (context.validationError) return; setTo(value?.format("YYYY-MM-DD") ?? ""); if (!step) setReport(undefined); setError(""); }}
                  slotProps={reportDatePickerSlotProps}
                />
              </LocalizationProvider>
              <div className="flex items-center justify-between gap-3">
              {step === 'dates' && onBack ? <button type="button" disabled={pending} onClick={onBack} className="rounded-xl border border-[#B9D6ED] px-5 py-3 text-sm font-black text-[#0067B3] disabled:opacity-60">Back</button> : null}
              <button type="button" disabled={pending} onClick={() => void generate()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#005F9E] disabled:cursor-wait disabled:opacity-60 active:translate-y-px">
                <AssessmentOutlinedIcon fontSize="small" />
                {pending ? "Generating…" : "Generate"}
              </button>
              </div>
            </div>
          </section>}
          {step !== 'type' && error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        </div>
  );

  return (
    <div className={`flex flex-col gap-5 ${embedded ? '' : 'min-h-[calc(100vh-48px)] w-full'}`}>
      {!embedded ? <header>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0067B3]">LexChain Operations</p>
        <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Generated Reports</h1>
        <p className="mt-1 text-sm font-semibold text-[#4B6382]">Generate a live user report or a demo system audit report.</p>
      </header> : null}

      {embedded ? (controlsTarget ? createPortal(embeddedControls, controlsTarget) : controlsTarget === undefined ? embeddedControls : null) : <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="sr-only">Report type</legend>
        {reportOptions.map((option) => (
          <label
            key={option.type}
            className={[
              "cursor-pointer rounded-2xl border bg-white p-5 shadow-sm shadow-[#DDEAF7]/35 transition",
              reportType === option.type ? "border-[#0067B3] ring-2 ring-[#0067B3]/15" : "border-[#E4EEF9] hover:border-[#B9D6ED]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="system-report-type"
              value={option.type}
              checked={reportType === option.type}
              disabled={pending}
              onChange={() => { setReportType(option.type); setReport(undefined); setError(""); }}
              aria-label={option.title}
              className="accent-[#0067B3]"
            />
            <span className="contents">
              <span className="ml-3 text-lg font-black text-[#071B33]">{option.title}</span>
              <span className="mt-2 block text-sm font-semibold leading-6 text-[#5B6F8A]">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>}

      {!embedded ? <section aria-label="Report dates" className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
        <p className="basis-full text-sm font-semibold text-[#5B6F8A]">System Users dates use inclusive UTC calendar days.</p>
        <label className={embedded ? "text-sm font-black text-[#0C2B49]" : "grid gap-1 text-sm font-black text-[#071B33]"}>
          From
          <input type="date" value={from} disabled={pending} onChange={(event) => { setFrom(event.target.value); setReport(undefined); setError(""); }} className={embedded ? "mt-2 block w-full rounded-xl border border-[#D9E5F0] px-3 py-2.5 font-semibold" : "rounded-xl border border-[#D7E4F2] px-3 py-2 font-semibold"} />
        </label>
        <label className={embedded ? "text-sm font-black text-[#0C2B49]" : "grid gap-1 text-sm font-black text-[#071B33]"}>
          To
          <input type="date" value={to} disabled={pending} onChange={(event) => { setTo(event.target.value); setReport(undefined); setError(""); }} className={embedded ? "mt-2 block w-full rounded-xl border border-[#D9E5F0] px-3 py-2.5 font-semibold" : "rounded-xl border border-[#D7E4F2] px-3 py-2 font-semibold"} />
        </label>
        <button type="button" disabled={pending} onClick={() => void generate()} className={embedded ? "rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white hover:bg-[#005F9E] disabled:cursor-wait disabled:opacity-60" : "rounded-xl bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white hover:bg-[#005F9E] disabled:cursor-wait disabled:opacity-60"}>
          {pending ? "Generating…" : "Generate"}
        </button>
      </section> : null}

      {!embedded && error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

      {pending ? (
        <section role="status" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#CFE1F2] bg-white px-6 py-10 text-center shadow-sm shadow-[#DDEAF7]/25">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0067B3]"><AssessmentOutlinedIcon /></span>
          <div>
            <h2 className="text-lg font-black text-[#071B33]">Generating preview…</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5B6F8A]">Loading {selected.title}…</p>
          </div>
        </section>
      ) : null}

      {!pending && !report && !error ? (
        <section role="status" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#CFE1F2] bg-white px-6 py-10 text-center shadow-sm shadow-[#DDEAF7]/25">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0067B3]"><AssessmentOutlinedIcon /></span>
          <div>
            <h2 className="text-lg font-black text-[#071B33]">Your preview will appear here</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5B6F8A]">
              Choose a date range and generate {selected.title}.
            </p>
          </div>
        </section>
      ) : null}

      {report ? (
        <section aria-label={`${generated?.title} report`} className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4EEF9] bg-[#FBFDFF] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#166534]"><AssessmentOutlinedIcon fontSize="small" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#0067B3]">CSV preview</span>
                  <span className="rounded-full bg-[#EAF8F0] px-2.5 py-1 text-xs font-black text-[#166534]">Ready</span>
                </div>
                <h2 className="mt-1 text-xl font-black text-[#071B33]">{generated?.title}</h2>
                <p className="mt-1 text-sm font-semibold text-[#5B6F8A]">{report.rows.length} {report.rows.length === 1 ? "row" : "rows"} in this preview <span aria-hidden="true">·</span> {report.from} to {report.to}</p>
              </div>
            </div>
            <button type="button" onClick={handleDownloadReport} className="inline-flex items-center gap-2 rounded-xl border border-[#B9D6ED] bg-white px-4 py-2.5 text-sm font-black text-[#0067B3] transition hover:border-[#0067B3] hover:bg-[#F0F7FF] active:translate-y-px">
              <DownloadOutlinedIcon fontSize="small" />
              Download CSV
            </button>
          </div>
          {report.reportType === "system-audit" ? <p className="mx-5 mt-5 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-3 py-2.5 text-sm font-bold text-[#5B6F8A] sm:mx-6">System audit reporting is not available yet; these are seeded demo records.</p> : null}
          <div className="mt-5 overflow-x-auto px-5 pb-5 sm:px-6">
            {report.rows.length ? (
              <table aria-label={`${generated?.title} preview`} className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#F8FBFF] text-xs uppercase tracking-[0.06em] text-[#5B6F8A]">
                  <tr>{report.columns.map((column) => <th key={column} className="border-b border-[#D9E5F0] px-4 py-3 font-black">{column}</th>)}</tr>
                </thead>
                <tbody>
                  {report.rows.map((row, index) => (
                    <tr key={index} className="transition hover:bg-[#FBFDFF]">
                      {report.columns.map((column) => <td key={column} className="border-b border-[#EEF4F8] px-4 py-3 font-semibold text-[#0C2B49]">{String(row[column] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-5 sm:p-6">
                <EmptyState
                  icon={<AssessmentOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
                  title="No rows in this report"
                  description={report.reportType === "system-users" ? "No users were created during this date range." : "No seeded rows fall within this date range."}
                />
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
