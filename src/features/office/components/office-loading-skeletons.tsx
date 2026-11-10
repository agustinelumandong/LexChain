import { LoadingLine, LoadingPanel, LoadingPulse, LoadingRegion } from '@/shared/components/ui/loading-pulse';
import { PageHeaderSkeleton } from '@/shared/components/ui/page-loading-skeleton';

const range = (length: number) => Array.from({ length }, (_, index) => index);

export function OfficeSettingsSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex max-w-3xl flex-col gap-5">
      <PageHeaderSkeleton eyebrow />
      <LoadingPulse className="h-14" />
      <LoadingPanel className="space-y-6 p-5">
        {range(2).map((field) => (
          <div key={field}>
            <LoadingLine className="h-4 w-44" />
            <LoadingLine className="mt-2 h-4 w-72 max-w-full" />
            <div className="mt-3 h-10 w-28 rounded-xl border border-[#D7E4F2]" />
          </div>
        ))}
      </LoadingPanel>
    </LoadingRegion>
  );
}

export function CategoriesSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex w-full flex-col gap-5">
      <PageHeaderSkeleton eyebrow action />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {range(3).map((metric) => <LoadingPulse key={metric} className="h-28" />)}
      </div>
      <LoadingPanel className="overflow-hidden">
        <div className="space-y-2 border-b border-[#E4EEF9] p-5">
          <LoadingLine className="h-5 w-44" />
          <LoadingLine className="h-4 w-80 max-w-full" />
        </div>
        {range(5).map((row) => (
          <div key={row} className="flex min-h-[68px] items-center justify-between gap-3 border-b border-[#EEF4F8] px-5 py-3 last:border-b-0">
            <div className="min-w-0 flex-1 space-y-2">
              <LoadingLine className="h-4 w-40 max-w-full" />
              <LoadingLine className="h-4 w-16" />
            </div>
            <LoadingLine className="size-9 shrink-0" />
          </div>
        ))}
      </LoadingPanel>
    </LoadingRegion>
  );
}

export function ReportsSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex w-full flex-col gap-6">
      <PageHeaderSkeleton eyebrow action />
      <LoadingPulse className="h-56" />
    </LoadingRegion>
  );
}

export function BooksShelfSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <LoadingPulse className="h-4 w-24" />
        <LoadingPulse className="h-3 w-16" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {range(3).map((book) => (
          <LoadingPanel key={book} className="flex min-h-[272px] flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <LoadingLine className="h-3 w-28" />
              <LoadingLine className="h-6 w-14" />
            </div>
            <LoadingLine className="mt-3 h-6 w-24" />
            <LoadingLine className="mt-2 h-4 w-20" />
            <div className="mt-5 space-y-2 border-t border-[#E8F0F8] pt-4">
              <LoadingLine className="h-3 w-28" />
              <LoadingLine className="h-4 w-36" />
              <LoadingLine className="h-4 w-44 max-w-full" />
            </div>
            <LoadingLine className="mt-auto h-11 w-32" />
          </LoadingPanel>
        ))}
      </div>
    </LoadingRegion>
  );
}
