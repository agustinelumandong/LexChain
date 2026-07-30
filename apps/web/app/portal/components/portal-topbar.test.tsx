// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PortalTopBar } from "./portal-topbar";

afterEach(cleanup);

const sharedProps = {
  fullName: "Ada Lovelace",
  initials: "AL",
  roleLabel: "User",
  processingCount: 2,
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
});
