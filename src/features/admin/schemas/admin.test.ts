import { describe, expect, it } from "vitest";
import { dashboardResponseSchema } from "./admin";

const dashboardResponse = {
  total_users: 0,
  total_lawyers: 0,
  total_documents: 0,
  total_processed: 0,
  total_failed: 0,
  total_on_chain: 0,
  pending_invitations: 0,
};

describe("dashboardResponseSchema", () => {
  it("accepts zero counts and rejects negative counts", () => {
    expect(dashboardResponseSchema.safeParse(dashboardResponse).success).toBe(true);
    expect(dashboardResponseSchema.safeParse({ ...dashboardResponse, total_users: -1 }).success).toBe(false);
  });
});
