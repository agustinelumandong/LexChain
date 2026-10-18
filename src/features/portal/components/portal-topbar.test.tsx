// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalTopBar } from "@/features/portal/components/portal-topbar";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} onClick={(event) => { event.preventDefault(); onClick?.(event); }} {...props} /> }));

afterEach(cleanup);

const sharedProps = {
  fullName: "Ada Lovelace",
  initials: "AL",
  roleLabel: "User",
  processingCount: 2,
  onSignOut: vi.fn(),
};

const actionableNotification = {
  id: "document-ready",
  title: "Document ready",
  body: "Your document is ready.",
  type: "document_recorded" as const,
  event_metadata: { document_id: "document-123" },
  is_read: false,
  created_at: "2026-07-20T10:00:00Z",
};

describe("PortalTopBar", () => {
  it("switches menus and dismisses them on Escape, outside taps, and focus leaving", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);
    const account = screen.getByRole("button", { name: "Open account menu" });
    const notifications = screen.getByRole("button", { name: "View notifications" });
    fireEvent.click(account);
    fireEvent.click(notifications);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    expect(screen.getByText("No unread notifications")).toBeTruthy();
    fireEvent.keyDown(notifications, { key: "Escape" });
    expect(screen.queryByText("No unread notifications")).toBeNull();
    expect(document.activeElement).toBe(notifications);
    fireEvent.click(account);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    fireEvent.click(account);
    fireEvent.focusIn(screen.getByRole("combobox", { name: "Search documents" }));
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });

  it("does not expose the processing summary to a participant", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);

    expect(screen.queryByRole("link", { name: "View processing documents" })).toBeNull();
  });

  it("links an issuer's processing summary to the consolidated dashboard", () => {
    render(
      <PortalTopBar
        {...sharedProps}
        role="lawyer"
        roleLabel="Lawyer"
      />,
    );

    expect(screen.getByRole("link", { name: "View processing documents" }).getAttribute("href"))
      .toBe("/portal/dashboard");
  });

  it("opens the account dropdown with Sign Out and no profile link", () => {
    render(<PortalTopBar {...sharedProps} role="user" />);
    const onSignOut = sharedProps.onSignOut;

    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));

    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("links document notifications and marks only the selected item read", () => {
    const onMarkNotificationRead = vi.fn();
    render(<PortalTopBar {...sharedProps} role="user" unreadCount={1} notifications={[actionableNotification]} onMarkNotificationRead={onMarkNotificationRead} />);

    fireEvent.click(screen.getByRole("button", { name: "View notifications" }));
    const link = screen.getByRole("link", { name: /Document ready/ });
    expect(link.getAttribute("href")).toBe("/portal/documents/document-123");
    fireEvent.click(link);
    expect(onMarkNotificationRead).toHaveBeenCalledWith("document-ready");
  });

  it("opens valid Google draft notifications in a new tab", () => {
    render(<PortalTopBar {...sharedProps} role="user" unreadCount={1} notifications={[{
      ...actionableNotification,
      type: "draft_comment",
      event_metadata: { draft_url: "https://docs.google.com/document/d/draft-123/edit" },
    }]} />);

    fireEvent.click(screen.getByRole("button", { name: "View notifications" }));
    const link = screen.getByRole("link", { name: /Document ready/ });
    expect(link.getAttribute("href")).toBe("https://docs.google.com/document/d/draft-123/edit");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("sends notifications without a safe destination to the inbox", () => {
    render(<PortalTopBar {...sharedProps} role="user" unreadCount={1} notifications={[{
      ...actionableNotification,
      event_metadata: { document_id: '../unsafe' },
    }]} />);

    fireEvent.click(screen.getByRole("button", { name: "View notifications" }));
    expect(screen.getByRole("link", { name: /Document ready/ }).getAttribute("href")).toBe("/portal/notifications");
  });
});
