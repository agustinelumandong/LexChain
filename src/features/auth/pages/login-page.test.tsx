// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./login-page";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => React.createElement("img", props),
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
