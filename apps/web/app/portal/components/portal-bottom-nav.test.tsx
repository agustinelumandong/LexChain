// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PortalBottomNav } from "./portal-bottom-nav";

afterEach(cleanup);

const systemManagementTools = [
  "User Accounts",
  "Issuer Invitations",
  "System Reports",
  "Audit Logs",
  "System Statistics",
];

describe("PortalBottomNav", () => {
  it("exposes all five system management tools for every issuer", () => {
    render(<PortalBottomNav pathname="/portal/dashboard" role="issuer" />);

    for (const label of systemManagementTools) {
      expect(screen.getByRole("link", { name: label })).toBeTruthy();
    }

    expect(screen.getByRole("navigation", { name: "Mobile portal navigation" }).className)
      .toContain("overflow-x-auto");
    expect(screen.getByRole("link", { name: "User Accounts" }).className)
      .toContain("shrink-0");
    expect(screen.getByText("Issuer Invitations")).toBeTruthy();
  });

  it("exposes visible participant navigation labels on mobile", () => {
    render(<PortalBottomNav pathname="/portal/documents" role="participant" />);

    for (const label of ["Shared Documents", "Invitations", "My E-copy Requests", "Profile & Security"]) {
      expect(screen.getByRole("link", { name: label })).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});
