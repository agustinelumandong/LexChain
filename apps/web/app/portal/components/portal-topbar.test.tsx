// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PortalTopBar } from "./portal-topbar";

afterEach(cleanup);

const sharedProps = {
  fullName: "Ada Lovelace",
  initials: "AL",
  roleLabel: "Document Participant",
  processingCount: 2,
};

describe("PortalTopBar", () => {
  it("does not expose Processing Monitor to a participant", () => {
    render(<PortalTopBar {...sharedProps} role="participant" />);

    expect(screen.queryByRole("link", { name: "View processing documents" })).toBeNull();
  });

  it("keeps Processing Monitor available to an issuer", () => {
    render(
      <PortalTopBar
        {...sharedProps}
        role="issuer"
        roleLabel="Document Issuer"
      />,
    );

    expect(screen.getByRole("link", { name: "View processing documents" }).getAttribute("href"))
      .toBe("/portal/processing");
  });
});
