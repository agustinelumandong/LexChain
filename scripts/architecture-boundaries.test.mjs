import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

const sourceRoot = join(process.cwd(), "src");

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

async function importsFrom(directory) {
  const files = await sourceFiles(join(sourceRoot, directory));
  return Promise.all(files.map(async (file) => ({
    file: relative(sourceRoot, file),
    source: await readFile(file, "utf8"),
  })));
}

test("architecture import boundaries", async () => {
  const [shared, features, all] = await Promise.all([
    importsFrom("shared"),
    importsFrom("features"),
    sourceFiles(sourceRoot),
  ]);

  for (const { file, source } of shared) {
    assert.doesNotMatch(source, /from ["']@\/(app|features|server)\//, file);
  }
  for (const { file, source } of features) {
    assert.doesNotMatch(source, /from ["']@\/app\//, file);
  }
  for (const file of all) {
    const source = await readFile(file, "utf8");
    if (/^["']use client["'];/m.test(source)) {
      assert.doesNotMatch(source, /from ["']@\/server\//, relative(sourceRoot, file));
    }
  }
});
