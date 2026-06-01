import { MockResourcePage } from "../mock-resource-page";

export default async function AdminAnalyticsPage() {
  const { adminAnalytics } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="analytics" rows={adminAnalytics} />
  );
}
