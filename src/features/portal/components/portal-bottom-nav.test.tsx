// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PortalBottomNav } from "@/features/portal/components/portal-bottom-nav";

afterEach(cleanup);

describe("PortalBottomNav", () => {
  it("keeps every lawyer destination reachable through a More menu", () => {
    render(<PortalBottomNav pathname="/portal/dashboard" role="lawyer" />);

    for (const label of ["Dashboard", "Documents", "Document Requests", "Books"]) {
      expect(screen.getByRole("link", { name: label })).toBeTruthy();
    }
    expect(screen.queryByRole("link", { name: "User Accounts" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "More" }));

    for (const label of ["Reports", "User Accounts", "Lawyer Invitations", "Profile & Security"]) {
      expect(screen.getByRole("link", { name: label })).toBeTruthy();
    }
    expect(screen.queryByRole("link", { name: "Audit Logs" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Office Settings" })).toBeNull();
    expect(screen.getByRole("navigation", { name: "Mobile portal navigation" }).className).not.toContain("overflow-x-auto");
  });

  it("shortens long labels on screen while keeping the full spoken name", () => {
    render(<PortalBottomNav pathname="/portal/dashboard" role="lawyer" />);
    expect(within(screen.getByRole("link", { name: "Document Requests" })).getByText("Requests")).toBeTruthy();
  });

  it("marks More as current when the active page is inside it", () => {
    render(<PortalBottomNav pathname="/portal/reports" role="lawyer" />);
    expect(screen.getByRole("button", { name: "More" }).getAttribute("aria-current")).toBe("page");
  });

  it("closes the More menu after choosing a destination", () => {
    render(<PortalBottomNav pathname="/portal/dashboard" role="lawyer" />);
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    fireEvent.click(screen.getByRole("link", { name: "Reports" }));
    expect(screen.queryByRole("link", { name: "Reports" })).toBeNull();
  });

  it("shows clients every destination without a More menu", () => {
    render(<PortalBottomNav pathname="/portal/documents" role="user" />);

    for (const [label, visibleLabel] of [["Shared Documents", "Documents"], ["Invitations", "Invitations"], ["My E-copy Requests", "Requests"]]) {
      const text = within(screen.getByRole("link", { name: label })).getByText(visibleLabel);
      expect(text.className).toContain("text-xs");
      expect(text.className).toContain("whitespace-nowrap");
    }
    expect(screen.queryByRole("button", { name: "More" })).toBeNull();
  });
});
