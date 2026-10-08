// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "@/features/auth/pages/register-page";

const searchParams = vi.hoisted(() => ({ value: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchParams.value),
}));
vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => React.createElement("img", props),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const fetchMock = vi.fn();

function renderRegister(query = "") {
  searchParams.value = query;
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RegisterPage />
    </QueryClientProvider>,
  );
}

function fillRegistrationForm(firstName = "Élodie") {
  fireEvent.change(screen.getByLabelText("First Name"), { target: { value: firstName } });
  fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "O'Connor" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "elodie@example.com" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "Password1" } });
  fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password1" } });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  searchParams.value = "";
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RegisterPage", () => {
  it("submits only supported fields and shows the backend confirmation message", async () => {
    const message = "Check your inbox to verify your account.";
    fetchMock.mockResolvedValue(Response.json({ requires_email_confirmation: true, message }));
    renderRegister();
    fillRegistrationForm();

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to login" }).getAttribute("href")).toBe("/login");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/portal/signup", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual({
      email: "elodie@example.com",
      password: "Password1",
      f_name: "Élodie",
      l_name: "O'Connor",
    });
  });

  it("accepts the backend password rules without requiring a special character", async () => {
    fetchMock.mockResolvedValue(Response.json({ requires_email_confirmation: false, message: "Your account is ready to sign in." }));
    renderRegister();
    fillRegistrationForm("Ada");

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Account created" })).toBeTruthy();
    expect(screen.getByText("Your account is ready to sign in.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ["1Ada", "Start with a letter"],
    ["A".repeat(51), "Names must be 1–50 characters"],
  ])("rejects backend-invalid name %s before sending a request", async (firstName, message) => {
    renderRegister();
    fillRegistrationForm(firstName);

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText((text) => text.includes(message))).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a digit but accepts passwords without special characters", async () => {
    renderRegister();
    fillRegistrationForm("Ada");
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "Password!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Password!" } });

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Add at least one number.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows signup failures while preserving entered values", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "An account with this email already exists." }, { status: 409 }));
    renderRegister();
    fillRegistrationForm("Ada");

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect((await screen.findByRole("alert")).textContent).toContain("An account with this email already exists.");
    expect((screen.getByLabelText("First Name") as HTMLInputElement).value).toBe("Ada");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("elodie@example.com");
    expect((screen.getByLabelText(/^Password/) as HTMLInputElement).value).toBe("Password1");
  });

  it("distinguishes temporary signup failures and keeps the form available", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "The signup service is temporarily unavailable. Try again shortly." }, { status: 502 }));
    renderRegister();
    fillRegistrationForm("Ada");

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect((await screen.findByRole("alert")).textContent).toContain("temporarily unavailable");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("elodie@example.com");
    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
  });

  it("explains that invitation signup is unsupported and never submits the token", async () => {
    renderRegister("token=invite-token&email=issuer@example.com");
    fillRegistrationForm("Ada");

    expect(screen.getByRole("alert").textContent).toContain("The invitation token has not been submitted or accepted.");
    expect(screen.getByRole("link", { name: "Start regular signup" }).getAttribute("href")).toBe("/register");
    const submit = screen.getByRole("button", { name: "Create account" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const form = submit.closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
    expect(screen.queryByRole("heading", { name: "Account created" })).toBeNull();
  });
});
