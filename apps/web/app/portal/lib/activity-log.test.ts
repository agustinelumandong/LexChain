import { describe, expect, it } from "vitest";
import { formatAuditEvent } from "./activity-log";

describe("formatAuditEvent", () => {
  it("maps known audit actions to readable event labels", () => {
    expect(formatAuditEvent("document_uploaded")).toBe("Document uploaded");
    expect(formatAuditEvent("document_anchored")).toBe("Document anchored");
    expect(formatAuditEvent("verification_completed")).toBe("Verification completed");
  });

  it("preserves unknown event text", () => {
    expect(formatAuditEvent("external_sync_finished")).toBe("external_sync_finished");
  });
});
