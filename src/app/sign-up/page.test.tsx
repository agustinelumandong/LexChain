import { describe, expect, it, vi } from "vitest";
import SignUpCompatibilityPage from "./page";

const permanentRedirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  permanentRedirect: (url: string) => permanentRedirect(url),
}));

describe("SignUpCompatibilityPage", () => {
  it("redirects to /register without params when none are provided", async () => {
    await SignUpCompatibilityPage({ searchParams: Promise.resolve({}) });
    expect(permanentRedirect).toHaveBeenCalledWith("/register");
  });

  it("redirects to /register with pre-filled email", async () => {
    await SignUpCompatibilityPage({
      searchParams: Promise.resolve({ email: "newcomer@example.com" }),
    });
    expect(permanentRedirect).toHaveBeenCalledWith("/register?email=newcomer%40example.com");
  });

  it("redirects to /register with token", async () => {
    await SignUpCompatibilityPage({
      searchParams: Promise.resolve({ token: "admin-token-123" }),
    });
    expect(permanentRedirect).toHaveBeenCalledWith("/register?token=admin-token-123");
  });

  it("redirects to /register with both email and token", async () => {
    await SignUpCompatibilityPage({
      searchParams: Promise.resolve({
        email: "newcomer@example.com",
        token: "admin-token-123",
      }),
    });
    expect(permanentRedirect).toHaveBeenCalledWith(
      "/register?email=newcomer%40example.com&token=admin-token-123"
    );
  });
});
