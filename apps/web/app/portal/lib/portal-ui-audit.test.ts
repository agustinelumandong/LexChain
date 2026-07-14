import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDirectory = path.resolve(process.cwd(), "app");

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [entryPath] : [];
  }));

  return nested.flat();
}

describe("portal UI source audit", () => {
  it("keeps rendered admin product copy neutral", async () => {
    const adminSources = await Promise.all((await sourceFiles(path.join(appDirectory, "admin"))).map((file) => readFile(file, "utf8")));

    expect(adminSources.join("\n")).not.toMatch(/super admin|developer dashboard|platform administration/i);
  });

  it("names the notification and uploaded-file removal controls", async () => {
    const [dashboard, upload] = await Promise.all([
      readFile(path.join(appDirectory, "portal/dashboard/page.tsx"), "utf8"),
      readFile(path.join(appDirectory, "portal/upload/page.tsx"), "utf8"),
    ]);

    expect(dashboard).toContain('aria-label="View notifications"');
    expect(upload).toContain('aria-label="Remove uploaded file"');
  });
});
