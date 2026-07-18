import { describe, expect, it } from "vitest";
import {
  createDemoCategory,
  deactivateDemoCategory,
  editDemoCategory,
  initialDemoCategories,
} from "./category-management";
import { canAccessPortalFeature } from "./portal-access";

describe("demo category management", () => {
  it("starts with local category data and creates a new active category in page state", () => {
    const category = createDemoCategory(initialDemoCategories, "Affidavits");

    expect(category).toMatchObject({ name: "Affidavits", active: true });
    expect(category.id).toMatch(/^demo-category-/);
  });

  it("edits a category name without changing its active state", () => {
    const edited = editDemoCategory(initialDemoCategories, "demo-category-contracts", "Contracts and Agreements");

    expect(edited).toContainEqual({
      id: "demo-category-contracts",
      name: "Contracts and Agreements",
      active: true,
    });
  });

  it("deactivates a category instead of removing it", () => {
    const deactivated = deactivateDemoCategory(initialDemoCategories, "demo-category-certificates");

    expect(deactivated).toContainEqual({
      id: "demo-category-certificates",
      name: "Certificates",
      active: false,
    });
    expect(deactivated).toHaveLength(initialDemoCategories.length);
  });
});

describe("category access", () => {
  it("allows the document issuer and denies participants", () => {
    expect(canAccessPortalFeature("issuer", "categories")).toBe(true);
    expect(canAccessPortalFeature("participant", "categories")).toBe(false);
  });
});
