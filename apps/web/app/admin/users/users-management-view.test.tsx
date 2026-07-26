// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MockToastProvider } from "../components/mock-ui";
import { AdminShell } from "../admin-shell";
import { updateDemoUser, UsersManagementView } from "./users-management-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const users = [
  {
    id: "admin-1",
    f_name: "LexChain",
    l_name: "Admin",
    email: "admin@lexchain.local",
    role: "admin",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-1",
    f_name: "Maria",
    l_name: "Santos",
    email: "maria@example.com",
    role: "lawyer",
    is_active: true,
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "user-2",
    f_name: "Juan",
    l_name: "Cruz",
    email: "juan@example.com",
    role: "user",
    is_active: false,
    created_at: "2026-01-03T00:00:00Z",
  },
];

function renderUsers() {
  return render(
    <MockToastProvider>
      <UsersManagementView users={users} total={users.length} />
    </MockToastProvider>,
  );
}

function rowFor(email: string) {
  return screen.getByRole("row", { name: new RegExp(email) });
}

afterEach(cleanup);

describe("updateDemoUser", () => {
  it("changes only the matching row and preserves omitted fields", () => {
    const result = updateDemoUser(users, "user-1", { f_name: "Mariel", role: "admin" });

    expect(result[1]).toEqual({ ...users[1], f_name: "Mariel", role: "admin" });
    expect(result[0]).toBe(users[0]);
    expect(result[2]).toBe(users[2]);
    expect(result[1].email).toBe("maria@example.com");
  });

  it("leaves every row unchanged for an unknown id", () => {
    const result = updateDemoUser(users, "missing", { is_active: false });

    expect(result).toEqual(users);
    expect(result.every((user, index) => user === users[index])).toBe(true);
  });

  it("does not mutate the input array or matching row", () => {
    const before = structuredClone(users);

    updateDemoUser(users, "user-1", { email: "updated@example.com" });

    expect(users).toEqual(before);
  });
});

describe("UsersManagementView demo mutations", () => {
  it("pre-fills the edit form with the selected user's current values", () => {
    renderUsers();

    fireEvent.click(within(rowFor("maria@example.com")).getByRole("button", { name: "Edit Maria Santos" }));

    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Maria");
    expect((screen.getByLabelText("Last name") as HTMLInputElement).value).toBe("Santos");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("maria@example.com");
    expect((screen.getByLabelText("Role") as HTMLSelectElement).value).toBe("lawyer");
    expect(screen.getByText("Demo mode — changes reset when this page is refreshed.")).toBeTruthy();
  });

  it("saves edits in the visible row for the current page session", () => {
    renderUsers();
    fireEvent.click(within(rowFor("maria@example.com")).getByRole("button", { name: "Edit Maria Santos" }));

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Mariel" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const updatedRow = rowFor("maria@example.com");
    expect(within(updatedRow).getByText("Mariel Santos")).toBeTruthy();
    expect(within(updatedRow).getByText("Admin")).toBeTruthy();
    expect(screen.getByText("Demo account updated")).toBeTruthy();
    expect(screen.queryByText("Backend endpoint needed")).toBeNull();
  });

  it("cancels edits without changing the visible row", () => {
    renderUsers();
    fireEvent.click(within(rowFor("maria@example.com")).getByRole("button", { name: "Edit Maria Santos" }));

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Changed" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(within(rowFor("maria@example.com")).getByText("Maria Santos")).toBeTruthy();
    expect(screen.queryByText("Changed Santos")).toBeNull();
  });

  it("suspends an active account in demo mode", () => {
    renderUsers();
    fireEvent.click(within(rowFor("maria@example.com")).getByRole("button", { name: "More actions for Maria Santos" }));
    fireEvent.click(screen.getByRole("button", { name: "Suspend user" }));

    expect(screen.getByText("Demo mode — changes reset when this page is refreshed.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));

    expect(within(rowFor("maria@example.com")).getByText("Suspended")).toBeTruthy();
  });

  it("reactivates a suspended account in demo mode", () => {
    renderUsers();
    fireEvent.click(within(rowFor("juan@example.com")).getByRole("button", { name: "More actions for Juan Cruz" }));
    fireEvent.click(screen.getByRole("button", { name: "Reactivate user" }));

    expect(screen.getByText("Demo mode — changes reset when this page is refreshed.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));

    expect(within(rowFor("juan@example.com")).getByText("Active")).toBeTruthy();
  });

  it("does not allow the displayed admin account to be suspended", () => {
    renderUsers();
    fireEvent.click(within(rowFor("admin@lexchain.local")).getByRole("button", { name: "More actions for LexChain Admin" }));

    const guard = screen.getByRole("button", { name: "Current account cannot be suspended" }) as HTMLButtonElement;
    expect(guard.disabled).toBe(true);
  });
});

it("removes the redundant Roles & Permissions admin navigation", () => {
  render(<AdminShell><p>Admin content</p></AdminShell>);

  expect(screen.queryByRole("link", { name: "Roles & Permissions" })).toBeNull();
});
