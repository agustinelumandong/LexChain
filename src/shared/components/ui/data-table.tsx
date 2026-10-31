"use client";

import { useState, type ReactNode } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "./button";

export type TableColumn<Row> = {
  key: string;
  label: string;
  render: (row: Row, index: number) => ReactNode;
};

export type TableProps<Row> = {
  ariaLabel: string;
  columns: TableColumn<Row>[];
  data: Row[];
  keyExtractor: (row: Row) => string;
  emptyMessage?: string;
};

type TablePresentationProps<Row> = TableProps<Row> & {
  minWidthClass: string;
  rowIndexOffset?: number;
};

function TablePresentation<Row>({
  ariaLabel,
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found.",
  minWidthClass,
  rowIndexOffset = 0,
}: TablePresentationProps<Row>) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table aria-label={ariaLabel} className={`w-full ${minWidthClass} text-sm`}>
        <thead>
          <tr className="border-b border-[var(--border-default)]">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)]">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={keyExtractor(row)} className="h-[65px] border-b border-[var(--border-soft)] transition-colors hover:bg-[var(--surface-soft)]">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4">
                  {column.render(row, rowIndexOffset + index)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Table<Row>(props: TableProps<Row>) {
  return <TablePresentation {...props} minWidthClass="min-w-[620px]" />;
}

export type DataTableProps<Row> = TableProps<Row> & {
  pageSize?: number;
};

export function DataTable<Row>({
  ariaLabel,
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found.",
  pageSize = 10,
}: DataTableProps<Row>) {
  const [page, setPage] = useState(0);
  const rowsPerPage = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = data.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <>
      <TablePresentation
        ariaLabel={ariaLabel}
        columns={columns}
        data={paged}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
        minWidthClass="min-w-[760px]"
        rowIndexOffset={currentPage * rowsPerPage}
      />
      <div className="mt-auto flex min-h-[var(--control-height-md)] items-center justify-between gap-4 border-t border-[var(--border-soft)] px-4 py-2 sm:px-6">
        <span role="status" aria-live="polite" className="text-sm text-[var(--text-secondary)]">
          Showing {data.length === 0 ? 0 : currentPage * rowsPerPage + 1}–{Math.min((currentPage + 1) * rowsPerPage, data.length)} of {data.length}
        </span>
        <nav aria-label={`${ariaLabel} pagination`} className="flex shrink-0 items-center gap-1">
          <IconButton
            type="button"
            size="sm"
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeftIcon aria-hidden="true" fontSize="small" />
          </IconButton>
          <span className="min-w-16 text-center text-sm font-medium text-[var(--text-primary)]">
            {currentPage + 1} / {totalPages}
          </span>
          <IconButton
            type="button"
            size="sm"
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRightIcon aria-hidden="true" fontSize="small" />
          </IconButton>
        </nav>
      </div>
    </>
  );
}
