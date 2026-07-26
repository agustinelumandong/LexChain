// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./page";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function renderResetPage(token?: string) {
  window.history.replaceState({}, "", token ? `/reset-password?token=${token}` : "/reset-password");
  return render(<ResetPasswordPage />);
}

describe("ResetPasswordPage", () => {
  it.each([undefined, "incorrect-token"])("shows an invalid-link state for token %s", async (token) => {
    renderResetPage(token);

    expect(await screen.findByText("This password reset link is invalid or has expired.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/login");
  });

  it("keeps weak passwords on the form", async () => {
    renderResetPage("lexchain-web-demo-reset");

    fireEvent.change(await screen.findByLabelText("New password"), { target: { value: "weak" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "weak" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByText("Use at least 8 characters.")).toBeTruthy();
    expect(screen.queryByText("Demo complete — no real password was changed.")).toBeNull();
  });

  it("keeps mismatched confirmation on the form", async () => {
    renderResetPage("lexchain-web-demo-reset");

    fireEvent.change(await screen.findByLabelText("New password"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Password2" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByText("Passwords do not match.")).toBeTruthy();
    expect(screen.queryByText("Demo complete — no real password was changed.")).toBeNull();
  });

  it("shows the demo completion state for a valid password and confirmation", async () => {
    renderResetPage("lexchain-web-demo-reset");

    fireEvent.change(await screen.findByLabelText("New password"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByText("Demo complete — no real password was changed.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/login");
  });
});
