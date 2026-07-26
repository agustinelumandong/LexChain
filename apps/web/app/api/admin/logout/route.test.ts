import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("admin logout", () => {
  it("expires the complete unified browser session", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    for (const name of ["admin_token", "portal_token", "user_role"]) {
      expect(response.cookies.get(name)?.value).toBe("");
      expect(response.cookies.get(name)?.maxAge).toBe(0);
    }
    expect(response.cookies.get("admin_token")?.httpOnly).toBe(true);
    expect(response.cookies.get("portal_token")?.httpOnly).toBe(true);
  });
});
