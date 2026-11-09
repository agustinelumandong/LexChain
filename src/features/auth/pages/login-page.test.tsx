// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage, { getPostLoginPath } from "./login-page";

vi.mock("next/image", () => ({
  default: ({ unoptimized, ...props }: React.ComponentProps<"img"> & { unoptimized?: boolean }) => {
    void unoptimized;
    return React.createElement("img", props);
  },
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("LoginPage", () => {
  it("explains an ended session and promises a return", () => {
    const queryClient = new QueryClient();
    render(<QueryClientProvider client={queryClient}><LoginPage sessionExpired /></QueryClientProvider>);
    expect(screen.getByRole("status").textContent).toContain("Your session ended");
  });

  it("returns a signed-in person to their page but never for an unsupported role", () => {
    expect(getPostLoginPath({ role: "lawyer" }, "/portal/books")).toBe("/portal/books");
    expect(getPostLoginPath({ role: "lawyer" }, undefined)).toBe("/portal/dashboard");
    expect(getPostLoginPath({ role: "unknown" }, "/portal/books")).toBe("/login");
  });

  it("describes who can sign in using lawyer and client", () => {
    const queryClient = new QueryClient();
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);
    expect(screen.getByText(/For lawyers and their clients/)).toBeTruthy();
  });

  it("asks for an authenticator code before completing sign-in", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ mfa_required: true, mfa_factor_id: "factor-1" }))
      .mockResolvedValueOnce(Response.json({ message: "Invalid code." }, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "issuer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    const code = await screen.findByLabelText("Authenticator code");
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Invalid code");
    expect(code.getAttribute("aria-invalid")).toBe("true");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ factor_id: "factor-1", code: "123456" });
  });

  it("offers enrollment and lets the user restart sign-in", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ mfa_required: true, mfa_factor_id: null }))
      .mockResolvedValueOnce(Response.json({ factor_id: "new-factor", qr_code: "data:image/svg+xml,<svg></svg>\n", secret: "SECRET" }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "issuer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByText("SECRET")).textContent).toBe("SECRET");
    expect(screen.getByText(/Google Authenticator or Microsoft Authenticator/)).toBeTruthy();
    expect(screen.getByRole("img", { name: /authenticator/i }).getAttribute("src")).toBe("data:image/svg+xml,<svg></svg>");
    fireEvent.click(screen.getByRole("button", { name: "Copy setup key" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("SECRET"));
    expect((await screen.findByRole("status")).textContent).toContain("Setup key copied.");
    writeText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    fireEvent.click(screen.getByRole("button", { name: "Copy setup key" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("copy it manually"));
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(await screen.findByLabelText("Password")).toBeTruthy();
    expect(fetchMock.mock.calls[2][0]).toBe("/api/auth/mfa/cancel");
  });
  it("shows rejected credentials beside both fields and clears the error on edit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Invalid credentials." }), { status: 401 })));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    fireEvent.change(email, { target: { value: "issuer@example.com" } });
    fireEvent.change(password, { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Incorrect email or password");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(password.getAttribute("aria-describedby")).toBe("login-error");
    fireEvent.change(password, { target: { value: "another-password" } });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(email.hasAttribute("aria-invalid")).toBe(false);
  });

  it("sends the remember-me choice without storing credentials in the browser", async () => {
    const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => Promise<Response>>(
      () => new Promise<Response>(() => {}),
    );
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);

    const rememberMe = screen.getByRole("button", { name: "Remember me" });
    expect(rememberMe.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(rememberMe);
    expect(rememberMe.getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "issuer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      email: "issuer@example.com",
      password: "Password123",
      rememberMe: true,
    });
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("toggles password visibility between masked and plain text", () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><LoginPage /></QueryClientProvider>);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput.type).toBe("password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeTruthy();
  });
});
