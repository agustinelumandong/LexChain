// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MockToastProvider } from "../components/mock-ui";
import { InvitationsManagementView } from "./invitations-management-view";

afterEach(cleanup);

const invitation = {
  status: "pending",
  expires_at: "2026-08-01T00:00:00Z",
  created_at: "2026-07-01T00:00:00Z",
};

function rowFor(email: string) {
  return within(screen.getByRole("row", { name: new RegExp(email) }));
}

it("maps only canonical invitation roles and marks every other value unsupported", () => {
  render(
    <MockToastProvider>
      <InvitationsManagementView
        mockMode
        invitations={[
          { ...invitation, id: "issuer", email: "issuer@example.com", role: "document_issuer" },
          { ...invitation, id: "participant", email: "participant@example.com", role: "document_participant" },
          { ...invitation, id: "legacy-user", email: "legacy-user@example.com", role: "user" },
          { ...invitation, id: "legacy-admin", email: "legacy-admin@example.com", role: "admin" },
          { ...invitation, id: "unknown", email: "unknown@example.com", role: "unexpected" },
        ]}
      />
    </MockToastProvider>,
  );

  expect(rowFor("issuer@example.com").getByText("Document Issuer")).toBeTruthy();
  expect(rowFor("participant@example.com").getByText("Document Participant")).toBeTruthy();
  for (const email of ["legacy-user@example.com", "legacy-admin@example.com", "unknown@example.com"]) {
    const row = rowFor(email);
    expect(row.getByText("Unsupported role")).toBeTruthy();
    expect(row.queryByText("Document Issuer")).toBeNull();
    expect(row.queryByText("Document Participant")).toBeNull();
  }
});
