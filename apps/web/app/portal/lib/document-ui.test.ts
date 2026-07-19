import { describe, expect, it } from "vitest";
import { getDocumentActions, getDocumentStatusLabel } from "./document-ui";

describe("document UI", () => {
  it("does not expose anchoring for completed off-chain documents", () => {
    expect(getDocumentActions("issuer", { status: "COMPLETED", on_chain: false }))
      .toEqual(["View PDF"]);
  });

  it("replaces anchoring with verification after anchoring", () => {
    expect(getDocumentActions("issuer", { status: "COMPLETED", on_chain: true }))
      .toEqual(["View PDF", "Verify Integrity"]);
  });

  it("uses the mobile status vocabulary", () => {
    expect(getDocumentStatusLabel("QUEUED")).toBe("Queued");
    expect(getDocumentStatusLabel("FAILED")).toBe("Failed");
  });

  it("does not expose issuer actions to participants", () => {
    expect(getDocumentActions("participant", { status: "COMPLETED", on_chain: false }))
      .toEqual(["View PDF"]);
  });

  it("labels the existing anchored mock status as completed", () => {
    expect(getDocumentStatusLabel("anchored")).toBe("Completed");
  });
});
