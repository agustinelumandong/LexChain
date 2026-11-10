import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge, type BadgeVariant } from '@/shared/components/ui';
import type { ApiSchema } from '@/shared/types';
import { googleDraftReturnPath } from '@/shared/utils/google-draft-return-context';
import { recordFieldLabel } from '@/shared/utils/record-field-label';

type RestoreOutcome = ApiSchema<'RestoreAllResponse'>;
type RecoverOutcome = ApiSchema<'RecoverResponse'>;
type RestoreItem = NonNullable<RestoreOutcome['restored']>[number];

export type RestoreSummary = {
  outcome: RestoreOutcome;
  /** Names from the report list, because a restore response carries only document IDs. */
  fileNames: ReadonlyMap<string, string>;
};

type ResultRow = { documentId: string; name: string; status: string; variant: BadgeVariant; detail?: string };

export function documentLabel(fileName?: string | null) {
  return fileName || 'Untitled document';
}

export function pdfAvailability(filePresent: RecoverOutcome['file_present']) {
  if (filePresent === true) return 'PDF is present.';
  return filePresent === false ? 'PDF is missing.' : 'PDF availability could not be confirmed.';
}

function uniqueLabels(fields: string[]) {
  return [...new Set(fields.map(recordFieldLabel))].join(', ');
}

function restoredRow(item: RestoreItem, name: string): ResultRow {
  const repaired = item.repaired?.length ? `Fixed: ${uniqueLabels(item.repaired.map((value) => value.field))}` : '';
  const unrepaired = item.unrepaired?.length ? `Needs manual recovery: ${uniqueLabels(item.unrepaired)}` : '';
  const detail = [repaired, unrepaired].filter(Boolean).join(' · ');
  if (unrepaired) return { documentId: item.document_id, name, status: 'Partly restored', variant: 'warning', detail };
  return item.restored
    ? { documentId: item.document_id, name, status: 'Restored', variant: 'success', detail }
    : { documentId: item.document_id, name, status: 'No repair needed', variant: 'default' };
}

function resultRows({ outcome, fileNames }: RestoreSummary): ResultRow[] {
  const nameOf = (documentId: string, fileName?: string | null) => documentLabel(fileName || fileNames.get(documentId));
  return [
    ...(outcome.failed ?? []).map((item): ResultRow => ({ documentId: item.document_id, name: nameOf(item.document_id, item.file_name), status: 'Failed', variant: 'danger', detail: item.message })),
    ...(outcome.restored ?? []).map((item) => restoredRow(item, nameOf(item.document_id))),
    ...(outcome.recovered ?? []).map((item): ResultRow => ({
      documentId: item.document_id,
      name: nameOf(item.document_id, item.file_name),
      status: 'Recovered',
      variant: item.file_present === true ? 'success' : 'warning',
      detail: item.file_present === true ? undefined : pdfAvailability(item.file_present),
    })),
  ];
}

function resultHeading(rowCount: number, attentionCount: number) {
  if (rowCount === 0) return 'No documents needed restoring';
  if (attentionCount === 0) return 'Restore complete';
  return `Restore finished: ${attentionCount} ${attentionCount === 1 ? 'needs' : 'need'} attention`;
}

export function TamperRestoreResults({ summary, onDismiss }: { summary: RestoreSummary; onDismiss: () => void }) {
  const rows = resultRows(summary);
  const attentionCount = rows.filter((row) => row.variant === 'warning' || row.variant === 'danger').length;
  return (
    <div role="region" aria-label="Restore all result" aria-live="polite" className={`mx-5 mt-5 rounded-xl border p-4 text-sm sm:mx-6 ${attentionCount ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
      <div className="flex items-center gap-3">
        {attentionCount ? <InfoOutlinedIcon aria-hidden="true" className="shrink-0 text-[#8A5B00]" /> : <CheckCircleIcon aria-hidden="true" className="shrink-0 text-emerald-700" />}
        <h3 className="min-w-0 flex-1 text-base font-bold text-[#0C2B49]">{resultHeading(rows.length, attentionCount)}</h3>
        <button type="button" aria-label="Dismiss restore results" onClick={onDismiss} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#5B6F8A] transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><CloseIcon fontSize="small" aria-hidden="true" /></button>
      </div>
      {rows.length > 0 && <ul className="mt-3 divide-y divide-black/5 rounded-lg bg-white px-3">
        {rows.map((row) => {
          const path = googleDraftReturnPath(row.documentId);
          return <li key={row.documentId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
            <div className="min-w-0">
              <p className="break-words font-bold text-[#0C2B49]">{path ? <Link className="text-[#0067B3] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]" href={`${path}/verify`}>{row.name}</Link> : row.name}</p>
              {row.detail && <p className="mt-0.5 text-[#5B6F8A]">{row.detail}</p>}
            </div>
            <Badge variant={row.variant}>{row.status}</Badge>
          </li>;
        })}
      </ul>}
    </div>
  );
}
