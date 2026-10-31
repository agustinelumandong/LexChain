// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "@/features/auth/pages/forgot-password-page";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("ForgotPasswordPage", () => {
  it("shows the generic demo result and reset link for a valid email", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "issuer@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText(
      "If an account exists for that email, a reset link has been sent.",
    )).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open demo reset page" }).getAttribute("href")).toBe(
      "/reset-password?token=lexchain-web-demo-reset",
    );
    expect(screen.getByText(
      "Demo mode — no email was sent and no password was changed.",
    )).toBeTruthy();
  });

  it("keeps invalid email input on the form", () => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByText("Enter a valid email address")).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Email").getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.queryByRole("link", { name: "Open demo reset page" })).toBeNull();
  });

  it("shows a loading state and lets the user retry after returning to the form", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
    vi.useFakeTimers();
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "issuer@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Sending…" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {});
    expect(screen.getByRole("link", { name: "Open demo reset page" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try another email" }));

    expect(screen.getByRole("button", { name: "Send reset link" })).toBeTruthy();
  });

  it("shows the production limitation without offering a fake reset form", () => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "false");
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("status").textContent).toContain(
      "Password recovery is not available yet. Contact your LexChain administrator",
    );
    expect(screen.getByText("Password recovery is not available in this deployment.")).toBeTruthy();
    expect(screen.queryByText("Enter account email and we will send reset instructions.")).toBeNull();
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.queryByRole("button", { name: "Send reset link" })).toBeNull();
    expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("link", { name: "Open demo reset page" })).toBeNull();
  });
});
