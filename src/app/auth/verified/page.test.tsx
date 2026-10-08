// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthVerifiedPage from "./page";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => React.createElement("img", props),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AuthVerifiedPage", () => {
  it("does not claim email verification just because the landing route was opened", () => {
    render(<AuthVerifiedPage />);

    expect(screen.getByRole("heading", { name: "Check your email" })).toBeTruthy();
    expect(screen.getByText(/open the verification link sent to your email/i)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Email verified" })).toBeNull();
  });

  it("shows the backend's neutral resend message without claiming delivery", async () => {
    const message = "If the account is eligible, verification instructions will be sent.";
    fetchMock.mockResolvedValue(Response.json({ message }));
    render(<AuthVerifiedPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Resend verification email" }));

    expect((await screen.findByRole("status")).textContent).toBe(message);
    expect(fetchMock).toHaveBeenCalledWith("/api/portal/resend-verification", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "ada@example.com" }),
    }));
  });

  it("shows resend failures and preserves the entered address", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Please wait before trying again." }, { status: 429 }));
    render(<AuthVerifiedPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Resend verification email" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Please wait before trying again.");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("ada@example.com");
  });

  it("validates the email before sending a resend request", async () => {
    render(<AuthVerifiedPage />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Resend verification email" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Enter a valid email.");
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });
});
