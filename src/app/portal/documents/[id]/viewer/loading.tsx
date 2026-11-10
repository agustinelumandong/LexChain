import { ViewerPanelSkeleton } from '@/features/documents/components/document-loading-skeletons';
import { LoadingPulse } from '@/shared/components/ui/loading-pulse';

export default function DocumentViewerLoading() {
  return (
    <div className="space-y-5">
      <LoadingPulse className="h-5 w-40" />
      <LoadingPulse className="h-6 w-48" />
      <ViewerPanelSkeleton label="Loading document preview" />
    </div>
  );
}
