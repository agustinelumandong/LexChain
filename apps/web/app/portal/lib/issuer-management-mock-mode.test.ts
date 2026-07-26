import { afterEach, expect, it, vi } from "vitest";

vi.mock("../../admin/components/admin-fetch", () => ({
  adminFetch: () => Promise.reject(new Error("Mock-mode pages must not call the backend.")),
}));

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

it("loads all server-rendered issuer management data from fixtures in server mock mode", async () => {
  vi.stubEnv("USE_MOCK_API", "true");
  vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "false");

  const [usersPage, invitationsPage, auditLogsPage, statisticsPage] = await Promise.all([
    import("../users/page"),
    import("../issuer-invitations/page"),
    import("../audit-logs/page"),
    import("../system-statistics/page"),
  ]);

  const usersView = await usersPage.default();
  const invitationsView = await invitationsPage.default();
  const auditLogsView = await auditLogsPage.default();
  const statisticsView = await statisticsPage.default();

  expect(usersView.props).toMatchObject({ total: 4 });
  expect(invitationsView.props).toMatchObject({ mockMode: true });
  expect(auditLogsView.props).toMatchObject({ total: 4 });
  expect(statisticsView.props).toMatchObject({ dashboard: { total_users: 120 } });
});
