import { LoadingField, LoadingLine, LoadingPanel, LoadingPulse, LoadingRegion } from '@/shared/components/ui/loading-pulse';
import { PageHeaderSkeleton } from '@/shared/components/ui/page-loading-skeleton';

const range = (length: number) => Array.from({ length }, (_, index) => index);

export function DocumentDetailSkeleton({ label = 'Loading document' }: { label?: string }) {
  return (
    <LoadingRegion label={label} className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 sm:px-6">
        <LoadingPulse className="h-4 w-36" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <LoadingPulse className="h-8 w-72 max-w-full" />
            <LoadingPulse className="h-6 w-20" />
          </div>
          <LoadingPulse className="h-11 w-36" />
        </div>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div className="flex shrink-0 gap-6 overflow-hidden border-b border-[#D7E4F2] px-4 py-3 sm:px-6">
          {range(5).map((tab) => <LoadingPulse key={tab} className="h-5 w-24 shrink-0" />)}
        </div>
        <div className="space-y-6 overflow-hidden px-4 py-4 sm:px-6">
          <LoadingPanel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LoadingLine className="h-5 w-40" />
              <LoadingLine className="h-10 w-28" />
            </div>
            <LoadingLine className="mt-5 h-4 w-full" />
            <LoadingLine className="mt-2 h-4 w-3/4" />
          </LoadingPanel>
          <LoadingPanel className="p-5 sm:p-6">
            <LoadingLine className="h-5 w-48" />
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {range(6).map((item) => (
                <div key={item} className="space-y-2">
                  <LoadingLine className="h-3 w-24" />
                  <LoadingLine className="h-4 w-40 max-w-full" />
                </div>
              ))}
            </div>
          </LoadingPanel>
        </div>
      </div>
    </LoadingRegion>
  );
}

function DocumentDirectoryCard() {
  return (
    <LoadingPanel className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E4EEF9] p-5">
        <div className="h-11 min-w-0 flex-1 rounded-xl border border-[#B8C9D9] sm:min-w-[280px]" />
        <LoadingLine className="h-11 w-32" />
        <LoadingLine className="h-11 w-32" />
      </div>
      <div className="hidden min-[1240px]:block">
        <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-5 border-b border-[#D9E5F0] bg-[#F8FBFF] px-5 py-3.5">
          {range(3).map((column) => <LoadingLine key={column} className="h-3 w-24" />)}
        </div>
        {range(6).map((row) => (
          <div key={row} className="grid h-[68px] grid-cols-[2fr_1.5fr_1fr] items-center gap-5 border-b border-[#D8E5F2] px-5">
            <div className="flex items-center gap-2">
              <LoadingLine className="size-8 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <LoadingLine className="h-4 w-48 max-w-full" />
                <LoadingLine className="h-3 w-32 max-w-full" />
              </div>
            </div>
            <LoadingLine className="h-6 w-24" />
            <LoadingLine className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-5 min-[1240px]:hidden">
        {range(4).map((row) => (
          <div key={row} className="flex gap-3 rounded-xl border border-[#D8E5F2] p-4">
            <LoadingLine className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <LoadingLine className="h-4 w-48 max-w-full" />
              <LoadingLine className="h-3 w-40 max-w-full" />
              <LoadingLine className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </LoadingPanel>
  );
}

export function DocumentListSkeleton() {
  return (
    <LoadingRegion label="Loading documents">
      <DocumentDirectoryCard />
    </LoadingRegion>
  );
}

export function DocumentsPageSkeleton() {
  return (
    <LoadingRegion label="Loading documents" className="flex min-h-0 flex-1 flex-col gap-5">
      <PageHeaderSkeleton />
      <DocumentDirectoryCard />
    </LoadingRegion>
  );
}

export function ReviewSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden md:h-[calc(100dvh-7rem)] md:overflow-hidden">
      <div className="md:flex md:min-h-0 md:flex-1 md:flex-col">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[#E8F0F8] pb-3">
          <PageHeaderSkeleton backLink />
          <div className="flex gap-2">
            <LoadingPulse className="h-9 w-24" />
            <LoadingPulse className="h-9 w-44" />
          </div>
        </div>
        <div className="grid min-w-0 gap-5 pt-5 md:min-h-0 md:flex-1 md:grid-cols-2">
          <LoadingPulse className="min-h-96 md:min-h-0" />
          <LoadingPanel className="hidden space-y-5 overflow-hidden p-5 md:block">
            {range(4).map((block) => (
              <div key={block} className="space-y-2">
                <LoadingLine className="h-3 w-16" />
                <LoadingLine className="h-3 w-full" />
                <LoadingLine className="h-3 w-11/12" />
                <LoadingLine className="h-3 w-4/5" />
              </div>
            ))}
          </LoadingPanel>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function ParticipantRowsSkeleton() {
  return (
    <LoadingPanel className="overflow-hidden">
      {range(3).map((row) => (
        <div key={row} className="flex items-center justify-between gap-4 border-b border-[#E8F0F8] px-5 py-4 last:border-b-0">
          <div className="min-w-0 flex-1 space-y-2">
            <LoadingLine className="h-4 w-40 max-w-full" />
            <LoadingLine className="h-3 w-52 max-w-full" />
          </div>
          <LoadingLine className="h-6 w-20 shrink-0" />
          <LoadingLine className="hidden h-11 w-24 shrink-0 sm:block" />
        </div>
      ))}
    </LoadingPanel>
  );
}

export function ParticipantsSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <PageHeaderSkeleton backLink eyebrow />
      <ParticipantRowsSkeleton />
    </LoadingRegion>
  );
}

export function UploadSkeleton({ label, embedded = false }: { label: string; embedded?: boolean }) {
  return (
    <LoadingRegion label={label} className="flex w-full max-w-none flex-1 flex-col gap-5">
      {!embedded && (
        <>
          <PageHeaderSkeleton backLink />
          <LoadingPulse className="h-[54px] w-full" />
          <div className="border-b border-[#D7E4F2] pb-5">
            <LoadingPulse className="mb-2.5 h-3 w-20" />
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {range(4).map((step) => <LoadingPulse key={step} className="h-[58px]" />)}
            </div>
          </div>
        </>
      )}
      <LoadingPanel className="p-5">
        <LoadingLine className="h-5 w-48" />
        <div className="mt-4 grid gap-4">
          <LoadingField />
          <LoadingField />
        </div>
      </LoadingPanel>
      <LoadingPulse className="h-48" />
    </LoadingRegion>
  );
}

export function AskSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="mx-auto flex h-[calc(100dvh-100px)] w-full max-w-5xl flex-col gap-3 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F0F8] pb-3 pt-1">
        <LoadingPulse className="h-6 w-44" />
        <LoadingPulse className="h-8 w-28" />
      </div>
      <LoadingPanel className="flex flex-1 flex-col justify-between overflow-hidden p-4 sm:p-6">
        <div className="space-y-4">
          {range(2).map((message) => (
            <div key={message} className="flex gap-3">
              <LoadingLine className="size-8 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <LoadingLine className="h-4 w-4/5" />
                <LoadingLine className="h-4 w-3/5" />
              </div>
            </div>
          ))}
        </div>
        <LoadingLine className="h-12 w-full" />
      </LoadingPanel>
    </LoadingRegion>
  );
}

export function ViewerPanelSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label} className="flex min-w-0 flex-1 flex-col">
      <LoadingPulse className="min-h-[400px] flex-1" />
    </LoadingRegion>
  );
}

export function VerifySkeleton() {
  return (
    <div className="relative flex flex-col gap-5 md:min-h-0 md:flex-1">
      <LoadingPulse className="h-32" />
      <div className="grid min-w-0 flex-1 gap-5 md:min-h-0 md:grid-cols-2">
        <LoadingPulse className="min-h-64 md:min-h-0" />
        <LoadingPulse className="min-h-64 md:min-h-0" />
      </div>
      <div
        role="status"
        aria-label="Checking the document"
        className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-[#F5FAFF]/60 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 rounded-full border border-[#D7E4F2] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(12,43,73,0.1)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7E4F2] border-t-[#0067B3]" />
          <p className="text-sm font-black text-[#0C2B49]">
            Checking this document against its saved version…
          </p>
        </div>
      </div>
    </div>
  );
}
