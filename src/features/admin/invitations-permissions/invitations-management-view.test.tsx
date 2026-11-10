// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MockToastProvider } from "@/features/admin/components/mock-ui";
import { InvitationsManagementView } from "@/features/admin/invitations-permissions/invitations-management-view";

afterEach(cleanup);

const invitation = {
  status: "pending",
  expires_at: "2026-08-01T00:00:00Z",
  created_at: "2026-07-01T00:00:00Z",
};

function rowFor(email: string) {
  return within(screen.getByRole("row", { name: new RegExp(email) }));
}

it("maps canonical and backend invitation roles while marking unknown values unsupported", () => {
  render(
    <MockToastProvider>
      <InvitationsManagementView
        mockMode
        invitations={[
          { ...invitation, id: "issuer", email: "issuer@example.com", role: "lawyer" },
          { ...invitation, id: "participant", email: "participant@example.com", role: "user" },
          { ...invitation, id: "legacy-user", email: "legacy-user@example.com", role: "user" },
          { ...invitation, id: "legacy-admin", email: "legacy-admin@example.com", role: "admin" },
          { ...invitation, id: "unknown", email: "unknown@example.com", role: "unexpected" },
        ]}
      />
    </MockToastProvider>,
  );

  expect(rowFor("issuer@example.com").getByText("Lawyer")).toBeTruthy();
  expect(rowFor("participant@example.com").getByText("Client")).toBeTruthy();
  expect(rowFor("legacy-user@example.com").getByText("Client")).toBeTruthy();
  expect(rowFor("legacy-admin@example.com").getByText("Unsupported role")).toBeTruthy();
  expect(rowFor("unknown@example.com").getByText("Unsupported role")).toBeTruthy();
});

it("shows claimed invitations as accepted and overdue pending invitations as expired", () => {
  const future = "2099-01-01T00:00:00Z";
  const past = "2020-01-01T00:00:00Z";

  render(
    <MockToastProvider>
      <InvitationsManagementView
        mockMode
        invitations={[
          { ...invitation, id: "claimed", email: "claimed@example.com", role: "lawyer", status: "claimed", expires_at: future },
          { ...invitation, id: "open", email: "open@example.com", role: "lawyer", status: "pending", expires_at: future },
          { ...invitation, id: "overdue", email: "overdue@example.com", role: "lawyer", status: "pending", expires_at: past },
        ]}
      />
    </MockToastProvider>,
  );

  expect(rowFor("claimed@example.com").getByText("Accepted")).toBeTruthy();
  expect(rowFor("claimed@example.com").getByText("—")).toBeTruthy();
  expect(rowFor("open@example.com").getByText("Pending")).toBeTruthy();
  expect(rowFor("overdue@example.com").queryByText("Pending")).toBeNull();
  expect(rowFor("overdue@example.com").getAllByText("Expired")).toHaveLength(2);
});

it("matches the portal management layout without duplicate header controls", () => {
  render(
    <MockToastProvider>
      <InvitationsManagementView mockMode invitations={[]} />
    </MockToastProvider>,
  );

  const view = screen.getByRole("heading", { name: "Lawyer Invitations" }).closest("header")?.parentElement;
  const directory = screen.getByRole("heading", { name: "Invitation Directory" }).closest("article");
  const activityList = screen.getByRole("heading", { name: "Recent Invitation Activity" }).closest("article")?.querySelector(".admin-table-scroll");

  expect(view?.className).toContain("xl:h-[calc(100dvh-113px)]");
  expect(view?.className).toContain("xl:min-h-0");
  expect(directory?.parentElement?.className).toContain("xl:flex-1");
  expect(directory?.className).toContain("xl:h-full");
  expect(activityList?.className).toContain("xl:flex-1");
  expect(screen.getByPlaceholderText("Search invitations...")).toBeTruthy();
  expect(screen.queryByPlaceholderText("Search by email or role...")).toBeNull();
  expect(screen.queryByRole("button", { name: "Filter" })).toBeNull();
  expect(screen.queryByText("More Filters")).toBeNull();
});

it("renders a coherent zero state in the chart center when invitations are empty (#164)", () => {
  render(
    <MockToastProvider>
      <InvitationsManagementView mockMode invitations={[]} />
    </MockToastProvider>,
  );

  const statusSection = screen.getByRole("heading", { name: "Invitation Status" }).closest("article")!;
  const chartCenter = within(statusSection).getByText("Total Invites").closest("div")!;
  expect(within(chartCenter).getByText("0")).toBeTruthy();

  const totalInvitesMetric = screen.getByText("Total Invites", { selector: "p" }).closest("article")!;
  expect(within(totalInvitesMetric).getByText("0")).toBeTruthy();
});

it("renders matching counts and percentages when invitations are populated (#164)", () => {
  render(
    <MockToastProvider>
      <InvitationsManagementView
        mockMode
        invitations={[
          { ...invitation, id: "inv-1", email: "one@example.com", role: "lawyer", status: "pending" },
          { ...invitation, id: "inv-2", email: "two@example.com", role: "lawyer", status: "accepted" },
        ]}
      />
    </MockToastProvider>,
  );

  const statusSection = screen.getByRole("heading", { name: "Invitation Status" }).closest("article")!;
  const chartCenter = within(statusSection).getByText("Total Invites").closest("div")!;
  expect(within(chartCenter).getByText("2")).toBeTruthy();

  const totalInvitesMetric = screen.getByText("Total Invites", { selector: "p" }).closest("article")!;
  expect(within(totalInvitesMetric).getByText("2")).toBeTruthy();
  expect(within(statusSection).getAllByText("(50%)")).toHaveLength(2);
});
