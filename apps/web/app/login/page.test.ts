import { describe, expect, it } from "vitest";
import { getRedirectPath } from "./page";

describe("unified login routing", () => {
  it("routes both canonical actors to the portal dashboard", () => {
    expect(getRedirectPath({ user: { role: "document_issuer" } })).toBe("/portal/dashboard");
    expect(getRedirectPath({ user: { role: "document_participant" } })).toBe("/portal/dashboard");
  });

  it("keeps unsupported roles at login", () => {
    expect(getRedirectPath({ user: { role: "staff" } })).toBe("/login");
  });
});
