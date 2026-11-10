import { LoadingPulse, LoadingRegion } from '@/shared/components/ui/loading-pulse';
import { PageHeaderSkeleton } from '@/shared/components/ui/page-loading-skeleton';

export default function DashboardLoading() {
  return (
    <LoadingRegion label="Loading dashboard" className="flex h-full min-h-0 flex-col gap-5">
      <PageHeaderSkeleton action />
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <LoadingPulse key={index} className="h-24 sm:h-28" />)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <LoadingPulse className="min-h-64" />
        <div className="flex min-h-0 flex-col gap-5">
          <LoadingPulse className="min-h-40 flex-1" />
          <LoadingPulse className="min-h-40 flex-1" />
        </div>
      </div>
    </LoadingRegion>
  );
}
