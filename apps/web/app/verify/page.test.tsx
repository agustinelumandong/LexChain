// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import VerifyPage from "./page";

afterEach(cleanup);

describe("VerifyPage", () => {
  it("describes public verification as an integrity-only hash check", () => {
    render(<VerifyPage />);

    expect(screen.getByText(/file hash matches a LexChain integrity record/i)).toBeTruthy();
    expect(
      screen.getByText(
        "This checks file integrity only. It does not determine legal validity, notarization, or enforceability.",
      ),
    ).toBeTruthy();
  });
});
