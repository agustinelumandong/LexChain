// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PortalBottomNav } from "./portal-bottom-nav";

afterEach(cleanup);

const superAdminTools = [
  "User Accounts",
  "Issuer Invitations",
  "System Reports",
  "Audit Logs",
  "System Statistics",
];

describe("PortalBottomNav", () => {
  it("exposes all five Super Admin tools for a privileged issuer", () => {
    render(
      <PortalBottomNav pathname="/portal/dashboard" role="issuer" superAdmin />,
    );

    for (const label of superAdminTools) {
      expect(screen.getByRole("link", { name: label })).toBeTruthy();
    }

    expect(screen.getByRole("navigation", { name: "Mobile portal navigation" }).className)
      .toContain("overflow-x-auto");
    expect(screen.getByRole("link", { name: "User Accounts" }).className)
      .toContain("shrink-0");
  });

  it("does not expose Super Admin tools for a standard issuer", () => {
    render(<PortalBottomNav pathname="/portal/dashboard" role="issuer" />);

    for (const label of superAdminTools) {
      expect(screen.queryByRole("link", { name: label })).toBeNull();
    }
  });
});
