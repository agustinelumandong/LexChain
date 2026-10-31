import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("legacy admin route redirects", () => {
  it.each([
    ["/admin/login", "/login"],
    ["/admin/users", "/portal/users"],
    ["/admin/system-settings", "/portal/dashboard"],
  ])("redirects %s to the current product route", (path, destination) => {
    const response = proxy(new NextRequest(`https://lexchain.example${path}`));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(`https://lexchain.example${destination}`);
  });
});
