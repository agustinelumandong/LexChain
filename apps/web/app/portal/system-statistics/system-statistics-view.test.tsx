// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { adminStats } from "../../admin/admin-demo-data";
import { SystemStatisticsView } from "./system-statistics-view";

afterEach(cleanup);

const dashboard = {
  total_users: adminStats.total_users,
  total_lawyers: adminStats.total_lawyers,
  total_documents: adminStats.total_documents,
  total_processed: adminStats.processed_documents,
  total_failed: adminStats.failed_documents,
  total_on_chain: adminStats.total_documents - adminStats.pending_documents,
  pending_invitations: adminStats.pending_documents,
};

describe("SystemStatisticsView", () => {
  it("shows the seven dashboard statistics supplied by the API contract", () => {
    render(<SystemStatisticsView dashboard={dashboard} />);

    const expected = [
      ["Registered Users", "120"],
      ["Document Issuers", "25"],
      ["Documents", "2,340"],
      ["Processed Documents", "2,100"],
      ["On-Chain Records", "2,220"],
      ["Failed Documents", "30"],
      ["Pending Invitations", "120"],
    ] as const;

    for (const [label, value] of expected) {
      const card = screen.getByRole("article", { name: label });
      expect(card.textContent).toContain(value);
    }
  });

  it("does not invent dashboard panels or trend data", () => {
    render(<SystemStatisticsView dashboard={dashboard} />);

    expect(screen.queryByText("System Health")).toBeNull();
    expect(screen.queryByRole("img", { name: /trend chart/i })).toBeNull();
    expect(screen.queryByText("Recent Activity")).toBeNull();
  });
});
