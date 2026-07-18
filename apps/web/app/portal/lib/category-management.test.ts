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

  it("gives duplicate names distinct IDs so each category can be updated independently", () => {
    const first = createDemoCategory(initialDemoCategories, "Affidavits");
    const categories = [...initialDemoCategories, first];
    const second = createDemoCategory(categories, "Affidavits");

    expect(second.id).not.toBe(first.id);

    const edited = editDemoCategory([...categories, second], second.id, "Sworn Affidavits");
    expect(edited.find((category) => category.id === first.id)).toMatchObject({
      name: "Affidavits",
      active: true,
    });
    expect(edited.find((category) => category.id === second.id)).toMatchObject({
      name: "Sworn Affidavits",
      active: true,
    });

    const deactivated = deactivateDemoCategory(edited, second.id);
    expect(deactivated.find((category) => category.id === first.id)).toMatchObject({ active: true });
    expect(deactivated.find((category) => category.id === second.id)).toMatchObject({ active: false });
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
