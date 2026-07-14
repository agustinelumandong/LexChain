import { expect, it } from "vitest";

import { getRequestActions } from "./request-ui";

it("allows an issuer to decide a pending request", () => {
  expect(getRequestActions("issuer", "pending")).toEqual(["Approve", "Reject"]);
});

it("does not show decision controls to a participant", () => {
  expect(getRequestActions("participant", "pending")).toEqual([]);
});

it("does not show decision controls after a request is decided", () => {
  expect(getRequestActions("issuer", "approved")).toEqual([]);
});
