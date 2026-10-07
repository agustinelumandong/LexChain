// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalTopBar } from "@/features/portal/components/portal-topbar";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

const sharedProps = {
  fullName: "Ada Lovelace",
  initials: "AL",
  roleLabel: "User",
  processingCount: 2,
  onSignOut: vi.fn(),
};

describe("PortalTopBar", () => {
  it("switches menus and dismisses them on Escape, outside taps, and focus leaving", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);
    const account = screen.getByRole("button", { name: "Open account menu" });
    const notifications = screen.getByRole("button", { name: "View notifications" });
    fireEvent.click(account);
    fireEvent.click(notifications);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    expect(screen.getByText("No unread notifications")).toBeTruthy();
    fireEvent.keyDown(notifications, { key: "Escape" });
    expect(screen.queryByText("No unread notifications")).toBeNull();
    expect(document.activeElement).toBe(notifications);
    fireEvent.click(account);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    fireEvent.click(account);
    fireEvent.focusIn(screen.getByRole("combobox", { name: "Search documents" }));
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });

  it("does not expose the processing summary to a participant", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);

    expect(screen.queryByRole("link", { name: "View processing documents" })).toBeNull();
  });

  it("links an issuer's processing summary to the consolidated dashboard", () => {
    render(
      <PortalTopBar
        {...sharedProps}
        role="lawyer"
        roleLabel="Lawyer"
      />,
    );

    expect(screen.getByRole("link", { name: "View processing documents" }).getAttribute("href"))
      .toBe("/portal/dashboard");
  });

  it("opens the account dropdown with Sign Out and no profile link", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);
    const onSignOut = sharedProps.onSignOut;

    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));

    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
