// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DownloadPage from "./page";

afterEach(cleanup);

describe("DownloadPage", () => {
  it("explains how to install the web app on Android and iOS without claiming store apps", () => {
    render(<DownloadPage />);

    expect(screen.getByRole("heading", { name: "Use LexChain from your phone." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Android with Chrome" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "iPhone or iPad with Safari" })).toBeTruthy();
    expect(screen.queryByText(/Google Play|App Store/)).toBeNull();
  });
});
