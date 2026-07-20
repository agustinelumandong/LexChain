// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

afterEach(cleanup);

describe("Home", () => {
  it("uses Sign In for the login call to action", () => {
    render(<Home />);

    expect(screen.queryByText("Admin Login")).toBeNull();
    for (const link of screen.getAllByRole("link", { name: "Sign In" })) {
      expect(link.getAttribute("href")).toBe("/login");
    }
  });
});
