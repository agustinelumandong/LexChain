// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalTopBar } from "./portal-topbar";

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

  it("opens the profile dropdown with Profile and Sign Out", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);
    const onSignOut = sharedProps.onSignOut;

    fireEvent.click(screen.getByRole("button", { name: "Open profile menu" }));

    expect(screen.getByRole("link", { name: "Profile" }).getAttribute("href")).toBe("/portal/profile");
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
