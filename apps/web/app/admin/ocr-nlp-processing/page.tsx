import { MockResourcePage } from "../mock-resource-page";

export default async function AdminOcrNlpProcessingPage() {
  const { adminProcessingLogs } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="ocr-nlp-processing" rows={adminProcessingLogs} />
  );
}
