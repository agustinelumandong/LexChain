// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useState } from "react";
import { Modal } from "./modal";

afterEach(cleanup);

it("moves focus into the modal, traps tab navigation, and restores focus on close", () => {
  function ModalHarness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open modal</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Book entries">
          <button type="button">First action</button>
          <button type="button">Last action</button>
          <input type="hidden" value="not focusable" readOnly />
        </Modal>
      </>
    );
  }

  render(<ModalHarness />);
  const openButton = screen.getByRole("button", { name: "Open modal" });
  openButton.focus();
  fireEvent.click(openButton);

  const closeButton = screen.getByRole("button", { name: "Close modal" });
  const lastButton = screen.getByRole("button", { name: "Last action" });
  expect(document.activeElement).toBe(closeButton);

  lastButton.focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(document.activeElement).toBe(closeButton);

  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(lastButton);

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "Book entries" })).toBeNull();
  expect(document.activeElement).toBe(openButton);
});
